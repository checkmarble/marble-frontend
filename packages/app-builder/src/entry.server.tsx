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

  const userAgent = request.headers.get('user-agent');
  return userAgent && isbot(userAgent)
    ? handleBotRequest(responseStatusCode, responseHeaders, App)
    : handleBrowserRequest(responseStatusCode, responseHeaders, App);
}

function handleBotRequest(
  responseStatusCode: number,
  responseHeaders: Headers,
  App: JSX.Element,
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(App, {
      onAllReady() {
        const body = new PassThrough();

        responseHeaders.set('Content-Type', 'text/html');

        resolve(
          new Response(createReadableStreamFromReadable(body), {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          }),
        );

        pipe(body);
      },
      onShellError(error: unknown) {
        reject(error);
      },
      onError(error: unknown) {
        didError = true;

        console.error(error);
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
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(App, {
      onShellReady() {
        const body = new PassThrough();

        responseHeaders.set('Content-Type', 'text/html');

        resolve(
          new Response(createReadableStreamFromReadable(body), {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          }),
        );

        pipe(body);
      },
      onShellError(err: unknown) {
        reject(err);
      },
      onError(error: unknown) {
        didError = true;

        console.error(error);
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
