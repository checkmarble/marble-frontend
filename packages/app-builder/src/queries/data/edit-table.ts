import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editTablePayloadSchema = z.object({
  description: z.string(),
  tableId: z.uuid(),
});

export type EditTablePayload = z.infer<typeof editTablePayloadSchema>;

const endpoint = getRoute('/ressources/data/editTable');

export const useEditTableMutation = () => {
  return useMutation({
    mutationKey: ['data', 'edit-table'],
    mutationFn: async (table: EditTablePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(table),
      });

      return response.json();
    },
  });
};
