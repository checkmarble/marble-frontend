import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

type ImportOrgActionResult = ServerFnResult<{ success: boolean }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function importOrgAction({ request, context }): ImportOrgActionResult {
    const { toastSessionService, i18nextService } = context.services;
    const [toastSession, t] = await Promise.all([
      toastSessionService.getSession(request),
      i18nextService.getFixedT(request, ['common', 'data']),
    ]);

    try {
      await request.json();

      // TODO: Wire up to backend POST /org-import when available
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      return data({ success: false }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      return data({ success: false }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    }
  },
);
