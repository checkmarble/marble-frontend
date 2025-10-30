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
    if (!['POST', 'DELETE'].includes(request.method)) {
      return { success: false, errors: ['Method not allowed'] };
    }
    const { toastSessionService } = context.services;
    const toastSession = await toastSessionService.getSession(request);

    const { tableId } = params;
    invariant(tableId, 'Table ID is required');

    // * POST * //
    const body = await request.json();

    if (request.method === 'POST') {
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
              ingestedDataFields: [...(current.ingestedDataFields ?? undefined), field],
            });
          return { success: true, data: exportedFields };
        }

        return { success: false, errors: ['Invalid payload'] };
      } catch (err) {
        console.error(err);
        return { success: false, errors: ['Failed to update exported fields'] };
      }
    }

    // * DELETE * //

    if (request.method === 'DELETE') {
      const parsedDelete = exportedFieldSchema.safeParse(body);
      if (!parsedDelete.success) {
        return { success: false, errors: ['Invalid payload'] };
      }
      try {
        const current =
          await context.authInfo.dataModelRepository.getDataModelTableExportedFields(tableId);
        if ('triggerObjectField' in parsedDelete.data) {
          const field = parsedDelete.data.triggerObjectField;
          const exists = (current.triggerObjectFields ?? []).includes(field);
          if (!exists) {
            return { success: false, errors: ['Field not found'] };
          }
          const next = {
            triggerObjectFields: (current.triggerObjectFields ?? []).filter((f) => f !== field),
            ingestedDataFields: current.ingestedDataFields ?? [],
          };
          const exportedFields =
            await context.authInfo.dataModelRepository.updateDataModelTableExportedFields(
              tableId,
              next,
            );
          return { success: true, data: exportedFields };
        }
        if ('ingestedDataField' in parsedDelete.data) {
          const field = parsedDelete.data.ingestedDataField;
          const exists = (current.ingestedDataFields ?? []).some(
            (f) => f.name === field.name && (f.path ?? []).join('.') === field.path.join('.'),
          );
          if (!exists) {
            return { success: false, errors: ['Field not found'] };
          }
          const next = {
            triggerObjectFields: current.triggerObjectFields ?? [],
            ingestedDataFields: (current.ingestedDataFields ?? []).filter(
              (field) =>
                !(
                  field.name === field.name && (field.path ?? []).join('.') === field.path.join('.')
                ),
            ),
          };
          const exportedFields =
            await context.authInfo.dataModelRepository.updateDataModelTableExportedFields(
              tableId,
              next,
            );
          return { success: true, data: exportedFields };
        }
        return { success: false, errors: ['Invalid payload'] };
      } catch (err) {
        console.error(err);
        setToastMessage(toastSession, {
          type: 'success',
          messageKey: 'common:errors.unknown',
        });
        return data({ success: false, errors: ['Failed to delete exported field'] }, [
          ['Set-Cookie', await toastSessionService.commitSession(toastSession)],
        ]);
      }
    }
    return { success: false, errors: ['Invalid method'] };
  },
);
