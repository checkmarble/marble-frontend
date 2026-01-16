import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteTablePayloadSchema = z.object({
  tableId: z.uuid(),
  perform: z.boolean(),
});

export type DeleteTablePayload = z.infer<typeof deleteTablePayloadSchema>;

export type DeleteTableResponse =
  | { success: true; data: DestroyDataModelReport }
  | { success: false; errors: unknown[] };

const endpoint = getRoute('/ressources/data/deleteTable');

export const useDeleteTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'delete-table'],
    mutationFn: async (payload: DeleteTablePayload): Promise<DeleteTableResponse> => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
