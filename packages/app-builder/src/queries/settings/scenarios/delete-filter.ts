import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod';
import { ingestedDataFieldSchema } from './schema';

export const deleteExportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);
export type DeleteExportedFieldPayload = z.infer<typeof deleteExportedFieldSchema>;

export const useDeleteFilterMutation = () => {
  return useMutation({
    mutationKey: ['settings', 'data-model', 'exported-fields', 'delete'],
    mutationFn: async ({
      tableId,
      payload,
    }: {
      tableId: string;
      payload: DeleteExportedFieldPayload;
    }) => {
      const endpoint = getRoute('/ressources/settings/data-model/tables/:tableId/exported-fields', {
        tableId,
      });
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
