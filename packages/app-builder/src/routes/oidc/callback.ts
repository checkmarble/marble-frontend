import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { initServerServices } from '@app-builder/services/init.server';
import { setToast } from '@app-builder/services/toast.server';
import { preserveSignedOut } from '@app-builder/utils/cross-tab-session';
import { getServerEnv } from '@app-builder/utils/environment';
import { safeRedirect } from '@app-builder/utils/safe-redirect';
import { createFileRoute } from '@tanstack/react-router';
import {
  exchangeTenantOidcCode,
  getOauth2Cookie,
  makeOidcService,
  type OAuth2CookieData,
  oauth2CookieSchema,
} from '../../services/auth/oidc.server';

function parseOauth2CookieData(rawCookie: string | null): OAuth2CookieData | null {
  if (!rawCookie) return null;
  try {
    return oauth2CookieSchema.parse(JSON.parse(rawCookie));
  } catch {
    return null;
  }
}

export const Route = createFileRoute('/oidc/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const idpError = url.searchParams.get('error');

        const proto = request.headers.get('x-forwarded-proto') ?? url.protocol;
        const secrets = [getServerEnv('SESSION_SECRET')];
        const secure = proto === 'https:';
        const oauth2Cookie = getOauth2Cookie({ secrets, secure });

        const rawCookie = await oauth2Cookie.parse(request.headers.get('cookie'));
        const cookieData = parseOauth2CookieData(rawCookie);

        const { appConfigRepository, authService, i18nextService } = initServerServices(request);

        const clearOauth2Cookie = await oauth2Cookie.serialize('', { maxAge: 0 });
        // A failed organization switch leaves the user signed in, and the sign-in page would send them straight back.
        const isOrganizationSwitch = !!cookieData?.organizationId;
        const failurePath = isOrganizationSwitch
          ? '/app-router'
          : preserveSignedOut('/sign-in', !!cookieData?.signedOut);
        const organizationSwitchError = async () => {
          const t = await i18nextService.getFixedT(request, ['navigation']);
          return t('navigation:organization_change.switch_error');
        };
        const redirectToSignIn = () =>
          new Response(null, {
            status: 302,
            headers: [
              ['Location', new URL(failurePath, request.url).toString()],
              ['Set-Cookie', clearOauth2Cookie],
            ],
          });

        if (idpError) {
          // Only the identity provider of this sign-in knows its `state`: a cross-site link must change nothing.
          if (!cookieData || state !== cookieData.state) {
            return new Response(null, {
              status: 302,
              headers: { Location: new URL('/sign-in', request.url).toString() },
            });
          }
          console.warn('[auth] identity provider returned an error', {
            error: idpError,
            description: url.searchParams.get('error_description'),
          });
          if (isOrganizationSwitch) {
            await setToast({ type: 'error', message: await organizationSwitchError() });
          } else {
            const authSession = await useAuthSession();
            await authSession.update({ authError: { message: 'SsoRefused' } });
          }
          return redirectToSignIn();
        }

        if (!code || !state || !rawCookie) {
          // An unrelated navigation must not consume another tab's pending sign-in.
          return new Response(null, {
            status: 302,
            headers: { Location: new URL(failurePath, request.url).toString() },
          });
        }

        if (!cookieData) {
          return new Response('Invalid oauth2 cookie', {
            status: 400,
            headers: { 'Set-Cookie': clearOauth2Cookie },
          });
        }

        if (state !== cookieData.state) {
          return new Response('State mismatch', { status: 400 });
        }

        const { tenantId, codeVerifier } = cookieData;

        let tokens;
        try {
          if (tenantId) {
            tokens = await exchangeTenantOidcCode(tenantId, code, codeVerifier);
          } else {
            const appConfig = await appConfigRepository.getAppConfig();
            const oidc = await makeOidcService(appConfig.auth.oidc);
            tokens = await oidc.exchangeCode(code, codeVerifier);
          }
        } catch (err) {
          if (err instanceof Error) {
            await setToast({
              type: 'error',
              message: isOrganizationSwitch ? await organizationSwitchError() : err.message,
            });
          }
          return redirectToSignIn();
        }

        try {
          await authService.authenticateOidc(request, tokens, {
            successRedirect: safeRedirect(cookieData.redirectTo, '/app-router'),
            failureRedirect: failurePath,
            failureToast: isOrganizationSwitch ? await organizationSwitchError() : undefined,
            // Without it, the backend verifies the tenant's ID token against the deployment-wide provider.
            tenantId,
            organizationId: cookieData.organizationId,
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
