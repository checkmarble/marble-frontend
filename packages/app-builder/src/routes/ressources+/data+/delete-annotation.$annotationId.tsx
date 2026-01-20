import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import invariant from 'tiny-invariant';

export const action = createServerFn(
  [authMiddleware],
  async function deleteAnnotationAction({ request, params, context }) {
    const { toastSessionService, i18nextService } = context.services;
    const { dataModelRepository } = context.authInfo;

    const [t, toastSession] = await Promise.all([
      i18nextService.getFixedT(request, ['common']),
      toastSessionService.getSession(request),
    ]);

    const annotationId = params['annotationId'];
    invariant(annotationId, 'Expected annotationId param to be present in url');

    try {
      await dataModelRepository.deleteAnnotation(annotationId);

      setToastMessage(toastSession, {
        type: 'success',
        message: t('common:success.deleted'),
      });

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch (_err) {
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
