import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteFieldPayloadSchema = z.object({
  fieldId: z.uuid(),
  perform: z.boolean(),
});

export type DeleteFieldPayload = z.infer<typeof deleteFieldPayloadSchema>;

export type DeleteFieldResponse =
  | { success: true; data: DestroyDataModelReport }
  | { success: false; errors: unknown[] };

const endpoint = getRoute('/ressources/data/deleteField');

export const useDeleteFieldMutation = () => {
  return useMutation({
    mutationKey: ['data', 'delete-field'],
    mutationFn: async (payload: DeleteFieldPayload): Promise<DeleteFieldResponse> => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
