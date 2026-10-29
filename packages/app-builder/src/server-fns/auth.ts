import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { discoverTenantOidc, makeOidcService, setOauth2Cookie } from '@app-builder/services/auth/oidc.server';
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
  .middleware([servicesMiddleware])
  .validator(signInPayload)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const successRedirect = safeRedirect(data.redirectTo ?? null, '/app-router');
    return context.services.authService.authenticate(
      request,
      { idToken: data.idToken, refreshToken: data.refreshToken, csrf: data.csrf },
      { successRedirect, failureRedirect: '/sign-in' },
    );
  });

export const signInEmailFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .validator(signInPayload)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const successRedirect = safeRedirect(data.redirectTo ?? null, '/app-router');
    return context.services.authService.authenticate(
      request,
      { idToken: data.idToken, refreshToken: data.refreshToken, csrf: data.csrf },
      { successRedirect, failureRedirect: '/sign-in-email' },
    );
  });

export type DiscoverSignInResult =
  | { type: 'redirect'; href: string }
  | { type: 'error'; error: 'unknown_domain' | 'discovery_failed' };

export const discoverSignInFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
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

      const oidc = await makeOidcService({
        issuer: discovery.issuer,
        client_id: discovery.client_id,
        redirect_uri: discovery.redirect_uri,
        scopes: discovery.scopes,
        extra_params: discovery.extra_params ?? {},
      });
      const { url, state, codeVerifier } = await oidc.buildAuthorizationUrl({ loginHint: data.email });
      setOauth2Cookie(request, {
        state,
        codeVerifier,
        tenantId: discovery.tenant_id,
        redirectTo: data.redirectTo ? safeRedirect(data.redirectTo, '/app-router') : undefined,
      });
      return { type: 'redirect', href: url };
    } catch (error) {
      captureUnexpectedError(error, 'server-fns/auth@discoverSignInFn', request);
      return { type: 'error', error: 'discovery_failed' };
    }
  });

export const logoutFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .validator(z.object({ redirectTo: z.string().optional() }))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const redirectTo = data.redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(data.redirectTo)}` : '/sign-in';
    await context.services.authService.logout(request, { redirectTo });
    throw redirect({ href: redirectTo });
  });

export const refreshTokenFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .validator(z.object({ idToken: z.string(), csrf: z.string() }))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    try {
      await context.services.authService.refresh(
        request,
        { idToken: data.idToken, csrf: data.csrf },
        { failureRedirect: '/sign-in' },
      );
    } catch (err) {
      if (err instanceof Response && err.status >= 300 && err.status < 400) {
        throw redirect({ href: err.headers.get('Location')!, statusCode: err.status });
      }
      throw err;
    }
  });

export const getSessionIdentityFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => ({
    organizationId: context.authInfo.user.organizationId,
    email: context.authInfo.user.actorIdentity.email ?? null,
  }));

export const changeOrganizationId = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .validator(z.object({ idToken: z.string().optional(), csrf: z.string(), newOrganizationId: z.uuid() }))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    try {
      await context.services.authService.changeOrganization(request, data);
    } catch (err) {
      if (err instanceof Response && err.status >= 300 && err.status < 400) {
        throw redirect({ href: err.headers.get('Location')!, statusCode: err.status });
      }
      throw err;
    }
  });
