import { createMiddlewareWithGlobalContext } from '@app-builder/core/requests';

export const oidcMiddleware = createMiddlewareWithGlobalContext(
  [],
  async function oidcMiddleware({ request, context }, next) {
    const oidc = await context.services.authService.makeOidcService(context.appConfig);
    const tokens = await oidc.authenticate(request);

    return next({ context: { oidc, oidcTokens: tokens } });
  },
);
