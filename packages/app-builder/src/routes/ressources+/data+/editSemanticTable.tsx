import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { EditSemanticTablePayloadSchema } from '@app-builder/queries/data/edit-semantic-table';
import { formatTableMutationError, getTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { omitUndefined } from '@app-builder/utils/omit-undefined';
import type { UpdateTableBodyDto } from 'marble-api';
import { z } from 'zod/v4';

type EditSemanticTableActionData =
  | { success: true; errors: [] }
  | { success: false; errors: unknown; status: number; message?: string };

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function editSemanticTableAction({ request, context }) {
    const { toastSessionService, i18nextService } = context.services;
    const { dataModelRepository } = context.authInfo;

    const [t, toastSession, raw] = await Promise.all([
      i18nextService.getFixedT(request, ['common']),
      toastSessionService.getSession(request),
      request.json(),
    ]);

    const parsed = EditSemanticTablePayloadSchema.safeParse(raw);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          errors: z.treeifyError(parsed.error),
          status: 400,
        } satisfies EditSemanticTableActionData,
        { status: 400 },
      );
    }

    try {
      const patchBody = omitUndefined({
        description: parsed.data.description,
        semantic_type: parsed.data.semantic_type,
        caption_field: parsed.data.caption_field,
        alias: parsed.data.alias,
        ftm_entity: parsed.data.ftm_entity as UpdateTableBodyDto['ftm_entity'] | undefined,
        primary_ordering_field: parsed.data.primary_ordering_field,
        fields: parsed.data.fields,
        links: parsed.data.links,
      } satisfies UpdateTableBodyDto);

      await dataModelRepository.patchDataModelTable(parsed.data.tableId, patchBody);

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
        } satisfies EditSemanticTableActionData,
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
