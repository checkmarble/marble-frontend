import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn } from '@app-builder/core/requests';
import { oidcMiddleware } from '@app-builder/middlewares/oidc-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn(
  [oidcMiddleware],
  async function oidcCallbackLoader({ request, context }) {
    const { toastSessionService } = context.services;

    if (!context.oidcTokens || context.oidcError) {
      const toastSession = await toastSessionService.getSession(request);

      if (context.oidcError && context.oidcError instanceof Error) {
        setToastMessage(toastSession, {
          type: 'error',
          message: context.oidcError.message,
        });
      }

      return redirect(getRoute('/sign-in'), {
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      });
    }

    await context.services.authService.authenticateOidc(request, context.oidcTokens, {
      successRedirect: getRoute('/app-router'),
      failureRedirect: getRoute('/sign-in'),
    });
  },
);
