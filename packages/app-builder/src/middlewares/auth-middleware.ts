import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { servicesMiddleware } from './services-middleware';

export const authMiddleware = createMiddleware({ type: 'function' })
  .middleware([servicesMiddleware])
  .server(async ({ next, context }) => {
    const request = getRequest();
    const { authService } = context.services;

    let authInfo;
    try {
      authInfo = await authService.isAuthenticated(request, {
        failureRedirect: '/sign-in',
      });
    } catch (error) {
      if (error instanceof Response && error.status >= 300 && error.status < 400) {
        throw redirect({ href: error.headers.get('Location')!, statusCode: error.status });
      }
      throw error;
    }

    const result = await next({ context: { authInfo } });

    const tokenUpdate = authInfo.tokenService.getUpdate();
    if (tokenUpdate.status) {
      const { marbleToken, refreshToken } = tokenUpdate;
      const authSession = await useAuthSession();
      await authSession.update({
        authToken: marbleToken ?? undefined,
        ...(refreshToken ? { refreshToken } : {}),
      });
    }

    return result;
  });
