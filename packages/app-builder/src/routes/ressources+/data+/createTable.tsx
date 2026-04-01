import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { isStatusConflictHttpError } from '@app-builder/models';
import { createTableValueSchema } from '@app-builder/queries/data/create-table';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { z } from 'zod/v4';

type CreateTableActionData = { success: true; data: { id: string } } | { success: false; errors: unknown };

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function createTableAction({ request, context }): ServerFnResult<CreateTableActionData> {
    const { toastSessionService, i18nextService } = context.services;
    const { dataModelRepository } = context.authInfo;

    const [t, toastSession, raw] = await Promise.all([
      i18nextService.getFixedT(request, ['common', 'data']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const parsed = createTableValueSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, errors: z.treeifyError(parsed.error) };
    }

    const result = await tryCatch(() => dataModelRepository.createTable(parsed.data));
    if (result.ok) {
      return { success: true, data: { id: result.value.id } };
    }

    setToastMessage(toastSession, {
      type: 'error',
      message: isStatusConflictHttpError(result.error)
        ? t('common:errors.data.duplicate_table_name')
        : t('common:errors.unknown'),
    });

    return data({ success: false, errors: [] }, [
      ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
    ]);
  },
);
