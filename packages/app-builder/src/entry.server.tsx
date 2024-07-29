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

import { serverServices } from './services/init.server';
import { getServerEnv } from './utils/environment';

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const { i18nextService } = serverServices;
  const i18n = await i18nextService.getI18nextServerInstance(
    request,
    remixContext,
  );

  const App = (
    <I18nextProvider i18n={i18n}>
      <RemixServer context={remixContext} url={request.url} />
    </I18nextProvider>
  );

  const prohibitOutOfOrderStreaming =
    isBotRequest(request) || remixContext.isSpaMode;

  return prohibitOutOfOrderStreaming
    ? handleBotRequest(responseStatusCode, responseHeaders, App)
    : handleBrowserRequest(responseStatusCode, responseHeaders, App);
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
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(App, {
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
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(App, {
      onShellReady() {
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

Sentry.init({
  dsn: getServerEnv('SENTRY_DSN'),
  environment: getServerEnv('SENTRY_ENVIRONMENT'),
  integrations: [Sentry.httpIntegration(), Sentry.requestDataIntegration()],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.5,
});

export const handleError: HandleErrorFunction = (error, { request }) => {
  if (error instanceof Error) {
    void Sentry.captureRemixServerException(error, 'remix.server', request);
  } else {
    // Optionally capture non-Error objects
    Sentry.captureException(error);
  }
};
