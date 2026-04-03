import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { editTablePayloadSchema } from '@app-builder/queries/data/edit-table';
import { formatTableMutationError, getTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { z } from 'zod/v4';

type EditTableActionData =
  | { success: true; errors: [] }
  | { success: false; errors: unknown; status: number; message?: string };

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function editTableAction({ request, context }) {
    const { toastSessionService, i18nextService } = context.services;
    const { dataModelRepository } = context.authInfo;

    const [t, toastSession, raw] = await Promise.all([
      i18nextService.getFixedT(request, ['common']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const parsed = editTablePayloadSchema.safeParse(raw);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          errors: z.treeifyError(parsed.error),
          status: 400,
        } satisfies EditTableActionData,
        { status: 400 },
      );
    }

    try {
      await dataModelRepository.patchDataModelTable(parsed.data.tableId, {
        description: parsed.data.description,
      });

      return { success: true, errors: [] };
    } catch (error) {
      const { status, message } = getTableMutationError(error, t);

      setToastMessage(toastSession, {
        type: 'error',
        message: formatTableMutationError({ status, message }),
      });

      return Response.json(
        {
          success: false,
          errors: [],
          status,
          message,
        } satisfies EditTableActionData,
        {
          status,
          headers: {
            'Set-Cookie': await toastSessionService.commitSession(toastSession),
          },
        },
      );
    }
  },
);
