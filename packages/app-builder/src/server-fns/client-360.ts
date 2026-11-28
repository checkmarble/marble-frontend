import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { marbleApiErrorMessage } from '@app-builder/models/http-errors';
import { addConfigurationPayloadSchema, client360SearchPayloadSchema } from '@app-builder/schemas/client360';
import { searchClient360 } from '@app-builder/server/client-360';
import { getDataModel, patchDataModelTable } from '@app-builder/server/data-model';
import { createServerFn } from '@tanstack/react-start';

export const addClient360ConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(addConfigurationPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const { tableId, semanticType, captionField, alias } = data;
      const dataModel = await getDataModel(context.api);
      const table = dataModel.find((t) => t.id === tableId);
      const field = table?.fields.find((f) => f.name === captionField);

      await patchDataModelTable(context.api, tableId, {
        semantic_type: semanticType,
        caption_field: captionField,
        alias,
        // Set the caption field's semantic_type to 'name' only if it has none
        // Treat both undefined and "" as "no semantic type"
        fields:
          field && !field.semanticType ? [{ op: 'MOD', data: { id: field.id, semantic_type: 'name' } }] : undefined,
      });
    } catch (error) {
      const message = marbleApiErrorMessage(error);
      if (message) return { error: message };
      throw error;
    }
  });

export const searchClient360Fn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(client360SearchPayloadSchema)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ context, data }): Promise<any> => {
    return searchClient360(context.api, data);
  });
