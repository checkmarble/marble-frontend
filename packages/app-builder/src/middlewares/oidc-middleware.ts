import { createMiddlewareWithGlobalContext } from '@app-builder/core/requests';
import { Tokens } from '@app-builder/routes/oidc+/auth';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';

export const oidcMiddleware = createMiddlewareWithGlobalContext(
  [],
  async function oidcMiddleware({ request, context }, next) {
    if (context.appConfig.auth.provider !== 'oidc') {
      throw redirect(getRoute('/sign-in'));
    }

    const oidc = await context.services.authService.makeOidcService(context.appConfig);
    let tokens: Tokens | null = null;
    let error: unknown | null = null;

    try {
      tokens = await oidc.authenticate(request);
    } catch (err) {
      error = err;
    }

    return next({ context: { oidc, oidcTokens: tokens, oidcError: error } });
  },
);
