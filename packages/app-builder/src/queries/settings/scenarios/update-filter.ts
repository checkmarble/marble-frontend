import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod';
import { ingestedDataFieldSchema } from './schema';

export const exportedFieldsSchema = z.object({
  triggerObjectFields: z.array(z.string()),
  ingestedDataFields: z.array(ingestedDataFieldSchema),
});

export const createExportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);
export type CreateExportedFieldPayload = z.infer<typeof createExportedFieldSchema>;

export const useCreateFilterMutation = () => {
  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'create'],
    mutationFn: async ({
      tableId,
      payload,
    }: {
      tableId: string;
      payload: CreateExportedFieldPayload;
    }) => {
      const endpoint = getRoute('/ressources/settings/data-model/tables/:tableId/exported-fields', {
        tableId,
      });
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
