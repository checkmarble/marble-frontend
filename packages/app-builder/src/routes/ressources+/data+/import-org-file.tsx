import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

type ImportOrgFileActionResult = ServerFnResult<{ success: boolean }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function importOrgFileAction({ request, context }): ImportOrgFileActionResult {
    const { toastSessionService, i18nextService } = context.services;
    const { organization } = context.authInfo;
    const [toastSession, t] = await Promise.all([
      toastSessionService.getSession(request),
      i18nextService.getFixedT(request, ['common', 'data']),
    ]);

    try {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof Blob)) {
        setToastMessage(toastSession, {
          type: 'error',
          message: t('common:errors.unknown'),
        });

        return data({ success: false }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
      }

      await organization.importOrganizationFromFile(file);

      setToastMessage(toastSession, {
        type: 'success',
        message: t('data:import_org.success'),
      });

      return data({ success: true }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    } catch (error) {
      console.error('[import-org-file] Import failed:', error);
      setToastMessage(toastSession, {
        type: 'error',
        message: t('common:errors.unknown'),
      });

      return data({ success: false }, [['Set-Cookie', await toastSessionService.commitSession(toastSession)]]);
    }
  },
);
