import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { addConfigurationPayloadSchema } from '@app-builder/queries/client360/add-configuration';
import { z } from 'zod/v4';

type AddConfigurationActionResult = ServerFnResult<{ success: boolean; errors: any }>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function addConfigurationAction({ request, context }): AddConfigurationActionResult {
    const {
      toastSessionService,
      i18nextService: { getFixedT },
    } = context.services;
    const { dataModelRepository } = context.authInfo;

    const rawData = await request.json();
    const toastSession = await toastSessionService.getSession(request);
    const t = await getFixedT(request, ['common']);

    const parsedData = addConfigurationPayloadSchema.safeParse(rawData);

    if (!parsedData.success) {
      return data({ success: false, errors: z.treeifyError(parsedData.error) });
    }

    try {
      const { tableId, ...body } = parsedData.data;
      await dataModelRepository.patchDataModelTable(tableId, body);

      setToastMessage(toastSession, {
        type: 'success',
        message: t('common:success.save'),
      });

      return data({ success: true, errors: [] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
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
