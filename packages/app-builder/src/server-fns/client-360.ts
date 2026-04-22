import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { addConfigurationPayloadSchema, client360SearchPayloadSchema } from '@app-builder/schemas/client360';
import { createServerFn } from '@tanstack/react-start';

export const addClient360ConfigurationFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(addConfigurationPayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      const { tableId, semanticType, captionField, alias } = data;
      const { dataModelRepository } = context.authInfo;

      // Fetch data model to find the caption field id
      const dataModel = await dataModelRepository.getDataModel();
      const table = dataModel.find((t) => t.id === tableId);
      const field = table?.fields.find((f) => f.name === captionField);

      await dataModelRepository.patchDataModelTable(tableId, {
        semantic_type: semanticType,
        caption_field: captionField,
        alias,
        // Set the caption field's semantic_type to 'name' only if it has none
        // Treat both undefined and "" as "no semantic type"
        fields:
          field && !field.semanticType ? [{ op: 'MOD', data: { id: field.id, semantic_type: 'name' } }] : undefined,
      });
    } catch {
      throw new Error('Failed to add configuration');
    }
  });

export const searchClient360Fn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(client360SearchPayloadSchema)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ context, data }): Promise<any> => {
    return context.authInfo.client360.searchClient360(data);
  });
