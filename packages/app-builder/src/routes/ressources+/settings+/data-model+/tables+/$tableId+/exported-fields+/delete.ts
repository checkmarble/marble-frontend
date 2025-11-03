import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ServerFnResult } from '@app-builder/core/middleware-types';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { ExportedFields } from '@app-builder/models/data-model';
import { ingestedDataFieldSchema } from '@app-builder/queries/settings/scenarios/schema';
import invariant from 'tiny-invariant';
import z from 'zod';

const exportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);

type GetExportedFieldsRessourceActionResult = ServerFnResult<
  | Response
  | {
      success: boolean;
      errors?: string[];
      data?: ExportedFields;
    }
>;

export const action = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function getExportedFieldsRessourceAction({
    request,
    context,
    params,
  }): GetExportedFieldsRessourceActionResult {
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);

    const { tableId } = params;
    invariant(tableId, 'Table ID is required');

    const body = await request.json();

    const parsedCreate = exportedFieldSchema.safeParse(body);
    if (!parsedCreate.success) {
      return { success: false, errors: ['Invalid payload'] };
    }

    try {
      const current =
        await context.authInfo.dataModelRepository.getDataModelTableExportedFields(tableId);

      if ('triggerObjectField' in parsedCreate.data) {
        const field = parsedCreate.data.triggerObjectField;
        if (current.triggerObjectFields.includes(field)) {
          return { success: false, errors: ['Field already exported'] };
        }
        const exportedFields =
          await context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
            triggerObjectFields: [...current.triggerObjectFields, field],
            ingestedDataFields: current.ingestedDataFields,
          });
        return { success: true, data: exportedFields };
      }

      if ('ingestedDataField' in parsedCreate.data) {
        const field = parsedCreate.data.ingestedDataField;
        const exists = (current.ingestedDataFields ?? []).some(
          (f) => f.name === field.name && (f.path ?? []).join('.') === field.path.join('.'),
        );
        if (exists) {
          return { success: false, errors: ['Field already exported'] };
        }
        const exportedFields =
          await context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
            triggerObjectFields: current.triggerObjectFields,
            ingestedDataFields: [...(current.ingestedDataFields ?? []), field],
          });
        return { success: true, data: exportedFields };
      }

      return { success: false, errors: ['Invalid payload'] };
    } catch {
      setToastMessage(toastSession, {
        type: 'error',
        messageKey: 'common:errors.unknown',
      });
      return data({ success: false, errors: ['Failed to delete exported field'] }, [
        ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
      ]);
    }
  },
);
