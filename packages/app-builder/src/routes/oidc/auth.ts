import { initServerServices } from '@app-builder/services/init.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { createFileRoute } from '@tanstack/react-router';
import { getOauth2Cookie, makeOidcService } from '../../services/auth/oidc.server';

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

        if (appConfig.auth.provider !== 'oidc') {
          return Response.redirect(new URL('/sign-in', request.url).toString(), 302);
        }

        const oidc = await makeOidcService(appConfig);
        const { url, state, codeVerifier } = await oidc.buildAuthorizationUrl();

        const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol;
        const oauth2Cookie = getOauth2Cookie({
          secrets: [getServerEnv('SESSION_SECRET')],
          secure: proto === 'https:',
        });

        const cookieHeader = await oauth2Cookie.serialize(JSON.stringify({ state, codeVerifier }));

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
