import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { formatTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod/v4';

export const deleteTablePayloadSchema = z.object({
  tableId: z.uuid(),
  perform: z.boolean(),
});

export type DeleteTablePayload = z.infer<typeof deleteTablePayloadSchema>;

export type DeleteTableResponse =
  | { success: true; data: DestroyDataModelReport }
  | { success: false; errors: unknown; status: number; message?: string };

const endpoint = getRoute('/ressources/data/deleteTable');

export const useDeleteTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'delete-table'],
    mutationFn: async (payload: DeleteTablePayload): Promise<DeleteTableResponse> => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as DeleteTableResponse;

      if (!response.ok && !result.success) {
        toast.error(
          formatTableMutationError({
            status: result.status,
            message: (result.message ?? response.statusText) || 'Request failed',
          }),
        );
      }

      return result;
    },
  });
};
