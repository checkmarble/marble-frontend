import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import * as Sentry from '@sentry/remix';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function aiReviewAction({ request, context }) {
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);
    const { aiAssistSettings } = context.authInfo;

    const rawData = await request.json();

    try {
      await aiAssistSettings.updateAiAssistSettings(rawData);
      setToastMessage(toastSession, {
        type: 'success',
        messageKey: 'common:success.save',
      });

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch (error) {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: 'common:errors.unknown',
      });
      Sentry.captureException(error);

      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
