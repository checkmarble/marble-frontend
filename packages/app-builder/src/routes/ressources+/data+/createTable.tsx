import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createTableValueSchema } from '@app-builder/queries/data/create-table';
import { formatTableMutationError, getTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { z } from 'zod/v4';

type CreateTableActionData =
  | { success: true; data: { id: string } }
  | { success: false; errors: unknown; status: number; message?: string };

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createTableAction({ request, context }) {
    const { toastSessionService, i18nextService } = context.services;
    const { dataModelRepository } = context.authInfo;

    const [t, toastSession] = await Promise.all([
      i18nextService.getFixedT(request, ['common', 'data']),
      toastSessionService.getSession(request),
    ]);

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          errors: [],
          status: 400,
          message: t('common:errors.invalid_request'),
        } satisfies CreateTableActionData,
        { status: 400 },
      );
    }
    const parsed = createTableValueSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          errors: z.treeifyError(parsed.error),
          status: 400,
        } satisfies CreateTableActionData,
        { status: 400 },
      );
    }

    const result = await tryCatch(() => dataModelRepository.createTable(parsed.data));
    if (result.ok) {
      return { success: true, data: { id: result.value.id } };
    }

    const { status, message } = getTableMutationError(result.error, t, {
      conflictMessage: isStatusConflictHttpError(result.error)
        ? t('common:errors.data.duplicate_table_name')
        : undefined,
    });

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
      } satisfies CreateTableActionData,
      {
        status,
        headers: {
          'Set-Cookie': await toastSessionService.commitSession(toastSession),
        },
      },
    );
  },
);
