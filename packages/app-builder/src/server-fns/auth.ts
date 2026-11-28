import { appConfigMiddleware } from '@app-builder/middlewares/app-config-middleware';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { rateLimitIpFunctionMiddleware } from '@app-builder/middlewares/rate-limit';
import { authenticate, changeOrganization, logout, refresh } from '@app-builder/server/auth';
import {
  discoverTenantOidc,
  makeOidcService,
  setOauth2Cookie,
  tenantOidcClientConfig,
} from '@app-builder/services/auth/oidc.server';
import { captureUnexpectedError } from '@app-builder/services/monitoring';
import { preserveSignedOut } from '@app-builder/utils/cross-tab-session';
import { safeRedirect } from '@app-builder/utils/safe-redirect';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import * as z from 'zod/v4';

const signInPayload = z.object({
  idToken: z.string(),
  refreshToken: z.string().optional(),
  csrf: z.string(),
  redirectTo: z.string().optional(),
});

export const signInFn = createServerFn({ method: 'POST' })
  .validator(signInPayload)
  .handler(async ({ data }) => {
    const request = getRequest();
    const successRedirect = safeRedirect(data.redirectTo ?? null, '/app-router');
    return authenticate(
      request,
      { idToken: data.idToken, refreshToken: data.refreshToken, csrf: data.csrf },
      { successRedirect, failureRedirect: '/sign-in' },
    );
  });

export const signInEmailFn = createServerFn({ method: 'POST' })
  .validator(signInPayload)
  .handler(async ({ data }) => {
    const request = getRequest();
    const successRedirect = safeRedirect(data.redirectTo ?? null, '/app-router');
    return authenticate(
      request,
      { idToken: data.idToken, refreshToken: data.refreshToken, csrf: data.csrf },
      { successRedirect, failureRedirect: '/sign-in-email' },
    );
  });

export type DiscoverSignInResult =
  | { type: 'redirect'; href: string }
  | { type: 'error'; error: 'unknown_domain' | 'discovery_failed' };

// Discovery tells which email domains have single sign-on, so it is rate limited per client IP.
// Not in `discoverTenantOidc`, which the organization switch of a signed-in user also calls.
// SignInWithEmailDiscovery retries after 1s, 2s and 4s: keep the window at most 1s.
export const discoverSignInFn = createServerFn({ method: 'POST' })
  .middleware([rateLimitIpFunctionMiddleware({ max: 1, windowMs: 1000 }), appConfigMiddleware])
  .validator(z.object({ email: z.email(), redirectTo: z.string().optional(), signedOut: z.boolean() }))
  .handler(async ({ context, data }): Promise<DiscoverSignInResult> => {
    const request = getRequest();
    const domain = data.email.slice(data.email.lastIndexOf('@') + 1).toLowerCase();

    try {
      const discovery = await discoverTenantOidc(domain);

      if (!discovery) {
        if (!context.appConfig.auth.providers.includes('firebase')) {
          return { type: 'error', error: 'unknown_domain' };
        }
        let href = `/sign-in-email?email=${encodeURIComponent(data.email)}`;
        if (data.redirectTo) href += `&redirectTo=${encodeURIComponent(data.redirectTo)}`;
        return { type: 'redirect', href: preserveSignedOut(href, data.signedOut) };
      }

      const oidc = await makeOidcService(tenantOidcClientConfig(discovery));
      const { url, state, codeVerifier } = await oidc.buildAuthorizationUrl({ loginHint: data.email });
      setOauth2Cookie(request, {
        state,
        codeVerifier,
        tenantId: discovery.tenant_id,
        redirectTo: data.redirectTo ? safeRedirect(data.redirectTo, '/app-router') : undefined,
        signedOut: data.signedOut,
      });
      return { type: 'redirect', href: url };
    } catch (error) {
      captureUnexpectedError(error, 'server-fns/auth@discoverSignInFn', request);
      return { type: 'error', error: 'discovery_failed' };
    }
  });

export const logoutFn = createServerFn({ method: 'POST' })
  .validator(z.object({ redirectTo: z.string().optional() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    const redirectTo = data.redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(data.redirectTo)}` : '/sign-in';
    await logout(request, { redirectTo });
    throw redirect({ href: redirectTo });
  });

export const refreshTokenFn = createServerFn({ method: 'POST' })
  .validator(z.object({ idToken: z.string(), csrf: z.string() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    await refresh(request, { idToken: data.idToken, csrf: data.csrf }, { failureRedirect: '/sign-in' });
  });

export const getSessionIdentityFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ({
    organizationId: context.user.organizationId,
    email: context.user.actorIdentity.email ?? null,
  }));

export const changeOrganizationId = createServerFn({ method: 'POST' })
  .validator(z.object({ idToken: z.string().optional(), csrf: z.string(), newOrganizationId: z.uuid() }))
  .handler(async ({ data }) => {
    const request = getRequest();
    return changeOrganization(request, data);
  });
