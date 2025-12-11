import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { createTableOptionSchema } from '@app-builder/models';
import { Dict } from '@swan-io/boxed';
import { z } from 'zod/v4';

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function updateDataDisplayAction({ request, context }) {
    const { dataModelRepository } = context.authInfo;
    const dataModel = await dataModelRepository.getDataModel();
    const toastService = context.services.toastSessionService;

    const schema = createTableOptionSchema(dataModel);
    const rawPayload = await request.json();
    const submission = schema.safeParse(rawPayload);

    const session = await toastService.getSession(request);

    if (!submission.success) {
      return data({ success: false, errors: z.treeifyError(submission.error) });
    }

    try {
      const payloadEntries = Dict.entries(submission.data);

      await Promise.all(
        payloadEntries.map(([tableId, body]) =>
          dataModelRepository.setDataModelTableOptions(tableId, {
            ...body,
            displayedFields: body.displayedFields ?? [],
          }),
        ),
      );

      setToastMessage(session, { type: 'success', messageKey: 'common:success.save' });

      return data({ success: true }, [['Set-Cookie', await toastService.commitSession(session)]]);
    } catch (_err) {
      setToastMessage(session, { type: 'error', messageKey: 'common:errors.unknown' });

      return data({ success: false, errors: [] }, [['Set-Cookie', await toastService.commitSession(session)]]);
    }
  },
);
