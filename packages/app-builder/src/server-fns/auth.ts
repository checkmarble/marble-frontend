import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { safeRedirect } from '@app-builder/utils/safe-redirect';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import * as z from 'zod/v4';

const signInPayload = z.object({ idToken: z.string(), csrf: z.string(), redirectTo: z.string().optional() });

export const signInFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .inputValidator(signInPayload)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const successRedirect = safeRedirect(data.redirectTo ?? null, '/app-router');
    return context.services.authService.authenticate(
      request,
      { idToken: data.idToken, csrf: data.csrf },
      { successRedirect, failureRedirect: '/sign-in' },
    );
  });

export const signInEmailFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .inputValidator(signInPayload)
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const successRedirect = safeRedirect(data.redirectTo ?? null, '/app-router');
    return context.services.authService.authenticate(
      request,
      { idToken: data.idToken, csrf: data.csrf },
      { successRedirect, failureRedirect: '/sign-in-email' },
    );
  });

export const logoutFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .inputValidator(z.object({ redirectTo: z.string().optional() }))
  .handler(async ({ context, data }) => {
    const request = getRequest();
    const redirectTo = data.redirectTo ? `/sign-in?redirectTo=${encodeURIComponent(data.redirectTo)}` : '/sign-in';
    await context.services.authService.logout(request, { redirectTo });
    throw redirect({ href: redirectTo });
  });

export const refreshTokenFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .inputValidator(z.object({ idToken: z.string(), csrf: z.string() }))
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
