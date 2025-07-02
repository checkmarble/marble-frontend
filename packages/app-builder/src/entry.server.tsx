import { createContentSecurityPolicy, createNonce } from '@mcansh/http-helmet';
import {
  createReadableStreamFromReadable,
  type EntryContext,
  type HandleErrorFunction,
} from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { PassThrough } from 'stream';

import { type AppConfig } from './models/app-config';
import { initServerServices } from './services/init.server';
import { captureUnexpectedRemixError } from './services/monitoring';
import { checkEnv, getClientEnvVars, getServerEnv } from './utils/environment';
import { NonceProvider } from './utils/nonce';

const ABORT_DELAY = 70000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const { i18nextService, appConfigRepository } = initServerServices(request);
  const i18n = await i18nextService.getI18nextServerInstance(request, remixContext);
  const nonce = createNonce();

  const appConfig = await appConfigRepository.getAppConfig();

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
    : handleBrowserRequest(responseStatusCode, responseHeaders, App, nonce, appConfig);
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
  nonce: string,
  appConfig: AppConfig,
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

        const clientEnv = getClientEnvVars();

        const firebaseUrl = appConfig.auth.firebase.isEmulator
          ? [appConfig.auth.firebase.emulatorUrl]
          : ['https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com'];

        const externalDomains = ['cdn.segment.com', 'api.segment.io', '*.sentry.io'];

        const frames: string[] = [];
        const metabaseUrl = clientEnv.METABASE_URL ?? appConfig.urls.metabase;
        const fbAuthDomain = appConfig.auth.firebase.authDomain;
        const marbleApiUrl = clientEnv.MARBLE_API_URL ?? appConfig.urls.marble;

        if (metabaseUrl) frames.push(metabaseUrl);
        if (fbAuthDomain) frames.push(fbAuthDomain);

        responseHeaders.set(
          'content-security-policy',
          createContentSecurityPolicy({
            baseUri: ["'none'"],
            defaultSrc: ["'self'"],
            frameAncestors: ["'none'"],
            objectSrc: ["'none'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: [`'nonce-${nonce}'`, "'unsafe-eval'", "'strict-dynamic'"],
            connectSrc: [
              "'self'",
              marbleApiUrl,
              ...firebaseUrl,
              ...externalDomains.map((d) => `https://${d}`),
            ],
            imgSrc: ["'self'", 'data:'],
            frameSrc: frames.length > 0 ? frames : ["'none'"],
          }),
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

  beforeSend(event, hint) {
    const error = hint?.originalException;
    console.log(error);

    // By default, remix will report a sentry error if a POST action is called on an endpoint that does not allow it (no action configured).
    // Those are noise, as we have no control on who calls out frontend remix server.
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      (error.status === 404 || error.status === 405)
    ) {
      return null;
    }

    return event;
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

// Sanity check at startup to verify we have all the environment needed to start the server
checkEnv();
