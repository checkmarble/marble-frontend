import {
  defaults,
  fetchWithAuthMiddleware,
  postToken,
  TokenService,
} from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment';
import { type EntryContext, Response } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import isbot from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { rollingCookie } from 'remix-utils';
import { PassThrough } from 'stream';

import { getI18nextServerInstance } from './config/i18n/i18next.server';
import { sessionCookie } from './services/auth/session.server';

const ABORT_DELAY = 5000;

defaults.baseUrl = getServerEnv('MARBLE_API_DOMAIN');

const bffTokenService = new TokenService({
  refreshToken: () => postToken('token12345'),
});

defaults.fetch = fetchWithAuthMiddleware({
  bffTokenService,
  getAuthorizationHeader: (token) => ({
    name: 'Authorization',
    value: `${token.token_type} ${token.access_token}`,
  }),
});

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  await rollingCookie(sessionCookie, request, responseHeaders);

  const i18n = await getI18nextServerInstance(request, remixContext);

  const App = (
    <I18nextProvider i18n={i18n}>
      <RemixServer context={remixContext} url={request.url} />
    </I18nextProvider>
  );

  return isbot(request.headers.get('user-agent'))
    ? handleBotRequest(responseStatusCode, responseHeaders, App)
    : handleBrowserRequest(responseStatusCode, responseHeaders, App);
}

function handleBotRequest(
  responseStatusCode: number,
  responseHeaders: Headers,
  App: JSX.Element
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(App, {
      onAllReady() {
        const body = new PassThrough();

        responseHeaders.set('Content-Type', 'text/html');

        resolve(
          new Response(body, {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          })
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
  App: JSX.Element
) {
  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(App, {
      onShellReady() {
        const body = new PassThrough();

        responseHeaders.set('Content-Type', 'text/html');

        resolve(
          new Response(body, {
            headers: responseHeaders,
            status: didError ? 500 : responseStatusCode,
          })
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
