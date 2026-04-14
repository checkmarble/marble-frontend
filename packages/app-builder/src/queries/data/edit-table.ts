import { formatTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod/v4';

export const editTablePayloadSchema = z.object({
  description: z.string(),
  tableId: z.uuid(),
});

export type EditTablePayload = z.infer<typeof editTablePayloadSchema>;
export type EditTableResponse =
  | { success: true; errors: [] }
  | { success: false; errors: unknown; status: number; message?: string };

const endpoint = getRoute('/ressources/data/editTable');

export const useEditTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'edit-table'],
    mutationFn: async (table: EditTablePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(table),
      });

      const result = (await response.json()) as EditTableResponse;

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
