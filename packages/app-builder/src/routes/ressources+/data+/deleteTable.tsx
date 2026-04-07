import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { deleteTablePayloadSchema } from '@app-builder/queries/data/delete-table';
import { formatTableMutationError, getTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { z } from 'zod/v4';

export const action = createServerFn([authMiddleware], async function deleteTableAction({ request, context }) {
  const { toastSessionService, i18nextService } = context.services;
  const { dataModelRepository } = context.authInfo;

  const [t, toastSession, raw] = await Promise.all([
    i18nextService.getFixedT(request, ['common']),
    toastSessionService.getSession(request),
    request.json(),
  ]);

  const parsed = deleteTablePayloadSchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        errors: z.treeifyError(parsed.error),
        status: 400,
      },
      { status: 400 },
    );
  }

  try {
    const result = await dataModelRepository.deleteTable(parsed.data.tableId, {
      perform: parsed.data.perform,
    });
    if (result.performed) {
      setToastMessage(toastSession, {
        type: 'success',
        message: t('common:success.deleted'),
      });
    }

    return Response.json(
      { success: true, data: result },
      {
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      },
    );
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
      },
      {
        status,
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      },
    );
  }
});
