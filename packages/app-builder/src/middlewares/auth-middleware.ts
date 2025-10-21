import { createMiddlewareWithGlobalContext } from '@app-builder/core/requests';
import { getRoute } from '@app-builder/utils/routes';

export const authMiddleware = createMiddlewareWithGlobalContext(
  [],
  async function authMiddleware({ request, context }, next) {
    const { authSessionService } = context.services;
    const authSession = await authSessionService.getSession(request);

    const authInfo = await context.services.authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

    const res = await next({ context: { authInfo } });

    // Updating the token in the cookies if it has been updated
    const tokenUpdate = authInfo.tokenService.getUpdate();
    if (tokenUpdate.status) {
      const { marbleToken, refreshToken } = tokenUpdate;
      authSession.set('authToken', marbleToken);
      if (refreshToken) {
        authSession.set('refreshToken', refreshToken);
      }
      res.pushHeader('Set-Cookie', await authSessionService.commitSession(authSession));
    }

    return res;
  },
);
