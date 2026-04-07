import { initServerServices } from '@app-builder/services/init.server';
import { setToast } from '@app-builder/services/toast.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { createFileRoute } from '@tanstack/react-router';
import { getOauth2Cookie, makeOidcService } from '../../services/auth/oidc.server';

export const Route = createFileRoute('/oidc/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        const proto = request.headers.get('x-forwarded-proto') ?? url.protocol;
        const secrets = [getServerEnv('SESSION_SECRET')];
        const secure = proto === 'https:';
        const oauth2Cookie = getOauth2Cookie({ secrets, secure });

        const rawCookie = await oauth2Cookie.parse(request.headers.get('cookie'));

        const { appConfigRepository, authService } = initServerServices(request);

        const clearOauth2Cookie = await oauth2Cookie.serialize('', { maxAge: 0 });

        if (!code || !state || !rawCookie) {
          return Response.redirect(new URL('/sign-in', request.url).toString(), 302);
        }

        let storedState: string;
        let codeVerifier: string;
        try {
          const parsed = JSON.parse(rawCookie as string) as {
            state: string;
            codeVerifier: string;
          };
          storedState = parsed.state;
          codeVerifier = parsed.codeVerifier;
        } catch {
          return new Response('Invalid oauth2 cookie', {
            status: 400,
            headers: { 'Set-Cookie': clearOauth2Cookie },
          });
        }

        if (state !== storedState) {
          return new Response('State mismatch', {
            status: 400,
            headers: { 'Set-Cookie': clearOauth2Cookie },
          });
        }

        const appConfig = await appConfigRepository.getAppConfig();
        const oidc = await makeOidcService(appConfig);

        let tokens;
        try {
          tokens = await oidc.exchangeCode(code, codeVerifier);
        } catch (err) {
          if (err instanceof Error) {
            await setToast({ type: 'error', message: err.message });
          }
          return new Response(null, {
            status: 302,
            headers: [
              ['Location', new URL('/sign-in', request.url).toString()],
              ['Set-Cookie', clearOauth2Cookie],
            ],
          });
        }

        try {
          await authService.authenticateOidc(request, tokens, {
            successRedirect: '/app-router',
            failureRedirect: '/sign-in',
          });
          // authenticateOidc always throws a redirect, but TypeScript doesn't know that
          /* istanbul ignore next */
          return new Response(null, { status: 302, headers: { Location: '/sign-in' } });
        } catch (err) {
          if (err instanceof Response && err.status >= 300 && err.status < 400) {
            // Propagate the redirect, appending cookie-clear header
            const headers = new Headers(err.headers);
            headers.append('Set-Cookie', clearOauth2Cookie);
            return new Response(null, { status: err.status, headers });
          }
          throw err;
        }
      },
    },
  },
});
