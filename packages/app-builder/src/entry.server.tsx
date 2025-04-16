import {
  createReadableStreamFromReadable,
  type EntryContext,
  type HandleErrorFunction,
} from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import * as crypto from 'crypto';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { PassThrough } from 'stream';

import { initServerServices } from './services/init.server';
import { captureUnexpectedRemixError } from './services/monitoring';
import { getServerEnv } from './utils/environment';
import { NonceProvider } from './utils/nonce';

const ABORT_DELAY = 70000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const { i18nextService } = initServerServices(request);
  const i18n = await i18nextService.getI18nextServerInstance(request, remixContext);

  const nonce = crypto.randomBytes(16).toString('hex');

  const App = (
    <I18nextProvider i18n={i18n}>
      <NonceProvider value={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
          nonce={nonce}
        />
      </NonceProvider>
    </I18nextProvider>
  );

  const prohibitOutOfOrderStreaming = isBotRequest(request) || remixContext.isSpaMode;

  return prohibitOutOfOrderStreaming
    ? handleBotRequest(responseStatusCode, responseHeaders, App, nonce)
    : handleBrowserRequest(responseStatusCode, responseHeaders, App, nonce);
}

function isBotRequest(request: Request) {
  const userAgent = request.headers.get('user-agent');
  if (!userAgent) {
    return false;
  }

  return isbot(userAgent);
}

function handleBotRequest(
  responseStatusCode: number,
  responseHeaders: Headers,
  App: JSX.Element,
  nonce?: string,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;

    const { pipe, abort } = renderToPipeableStream(App, {
      nonce,
      onAllReady() {
        shellRendered = true;
        const body = new PassThrough();
        const stream = createReadableStreamFromReadable(body);

        responseHeaders.set('Content-Type', 'text/html');

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode,
          }),
        );

        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          console.error(error);
        }
      },
    });

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  responseStatusCode: number,
  responseHeaders: Headers,
  App: JSX.Element,
  nonce?: string,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(App, {
      nonce,
      onShellReady() {
        shellRendered = true;
        const body = new PassThrough();
        const stream = createReadableStreamFromReadable(body);

        responseHeaders.set('Content-Type', 'text/html');

        const cspOrigins = [
          ['default-src', "'self'"],
          ['frame-ancestors', "'none'"],
          ['object-src', "'none'"],
          ['style-src', "'self' 'unsafe-inline'"],
          // ['script-src', `'nonce-${nonce}' 'strict-dynamic'`],
          ['script-src', `'self' 'nonce-${nonce}' cdn.segment.com`],
          // ['script-src-elem', `'self' 'nonce-${nonce}' 'strict-dynamic' cdn.segment.com`],
          ['connect-src', "'self' localhost:9099"],
          ['frame-src', `subdomain.metabaseapp.com`],
        ];

        responseHeaders.set(
          'content-security-policy',
          cspOrigins.flatMap((rule) => rule.join(' ')).join('; '),
        );

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode,
          }),
        );

        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell.  Don't log
        // errors encountered during initial shell rendering since they'll
        // reject and get logged in handleDocumentRequest.
        if (shellRendered) {
          console.error(error);
        }
      },
    });

    setTimeout(abort, ABORT_DELAY);
  });
}

Sentry.init({
  dsn: getServerEnv('SENTRY_DSN'),
  environment: getServerEnv('SENTRY_ENVIRONMENT'),
  integrations: [Sentry.httpIntegration(), Sentry.requestDataIntegration()],
  denyUrls: [
    /\/healthcheck/,
    /\/build\//,
    /\/favicons\//,
    /\/images\//,
    /\/fonts\//,
    /\/apple-touch-.*/,
    /\/robots.txt/,
    /\/favicon.ico/,
    /\/site\.webmanifest/,
  ],
  // This function is called for every transaction.
  // It should return a number between 0.0 and 1.0 to determine the sample rate.
  // The `samplingContext` contains information about the transaction.
  // For example, you could use the transaction name to decide the sample rate.
  tracesSampler(samplingContext) {
    if (samplingContext.request?.url?.includes('healthcheck')) {
      return 0;
    }
    if (
      [
        'routes/ressources+/auth+/refresh',
        'routes/ressources+/auth+/logout',
        'routes/_auth+/sign-in',
        'routes/ressources+/locales',
        'routes/app-router',
      ].includes(samplingContext.name)
    ) {
      return 0.01;
    }

    return 0.2;
  },
});

export const handleError: HandleErrorFunction = (error, { request }) => {
  // Skip capturing if the request is aborted as Remix docs suggest
  // Ref: https://remix.run/docs/en/main/file-conventions/entry.server#handleerror
  if (request.signal.aborted) {
    return;
  }
  captureUnexpectedRemixError(error, 'remix.server', request);
};
