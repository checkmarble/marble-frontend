import { createServerFn } from '@app-builder/core/requests';
import { oidcMiddleware } from '@app-builder/middlewares/oidc-middleware';
import { getRoute } from '@app-builder/utils/routes';

export const loader = createServerFn(
  [oidcMiddleware],
  async function oidcCallbackLoader({ request, context }) {
    await context.services.authService.authenticateOidc(request, context.oidcTokens, {
      successRedirect: getRoute('/app-router'),
      failureRedirect: getRoute('/sign-in'),
    });
  },
);
