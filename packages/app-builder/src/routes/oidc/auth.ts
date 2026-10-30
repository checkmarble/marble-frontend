import { getAuthMode } from '@app-builder/models/auth-mode';
import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { createFileRoute } from '@tanstack/react-router';
import { getOauth2Cookie, makeOidcService, type OAuth2CookieData } from '../../services/auth/oidc.server';

export interface Tokens {
  sub: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiredAt: number;
}

export const Route = createFileRoute('/oidc/auth')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { appConfigRepository } = initServerServices(request);
        const appConfig = await appConfigRepository.getAppConfig();

        // Only the deployment-wide provider starts here; per-tenant OIDC starts from email discovery.
        if (getAuthMode(appConfig.auth.providers) !== 'oidc-legacy') {
          // `Response.redirect` has immutable headers, which the server runtime cannot handle: build the 302 instead.
          return new Response(null, {
            status: 302,
            headers: { Location: new URL('/sign-in', request.url).toString() },
          });
        }

        const oidc = await makeOidcService(appConfig.auth.oidc);
        const { url, state, codeVerifier } = await oidc.buildAuthorizationUrl();
        const cookieData: OAuth2CookieData = { state, codeVerifier };

        const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol;
        const oauth2Cookie = getOauth2Cookie({
          secrets: [getServerEnv('SESSION_SECRET')],
          secure: proto === 'https:',
        });

        const cookieHeader = await oauth2Cookie.serialize(JSON.stringify(cookieData));

        return new Response(null, {
          status: 302,
          headers: {
            Location: url,
            'Set-Cookie': cookieHeader,
          },
        });
      },
    },
  },
});
