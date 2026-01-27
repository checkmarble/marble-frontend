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

    const screeningId = params['screeningId'];
    invariant(screeningId, 'Screening ID is required');

    const [toastSession, t] = await Promise.all([
      toastSessionService.getSession(request),
      getFixedT(request, ['common', 'continuousScreening']),
    ]);

    try {
      await continuousScreeningRepository.loadMoreMatches(screeningId);
      return data({ success: true });
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
