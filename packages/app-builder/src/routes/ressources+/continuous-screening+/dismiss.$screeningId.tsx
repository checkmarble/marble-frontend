import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import invariant from 'tiny-invariant';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async ({ request, context, params }) => {
    const {
      toastSessionService,
      i18nextService: { getFixedT },
    } = context.services;
    const { continuousScreening: continuousScreeningRepository } = context.authInfo;
    const { screeningId } = params;

    const [toastSession, t] = await Promise.all([
      toastSessionService.getSession(request),
      getFixedT(request, ['common', 'continuousScreenings']),
    ]);

    invariant(screeningId, 'Continuous screening ID is required');

    try {
      setToastMessage(toastSession, {
        type: 'success',
        message: t('continuousScreening:success.dismissed'),
      });

      await continuousScreeningRepository.dismiss(screeningId);
      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),
      });
      return data({ success: false, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
