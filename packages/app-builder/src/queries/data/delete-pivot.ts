import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deletePivotPayloadSchema = z.object({
  pivotId: z.uuid(),
  perform: z.boolean(),
});

export type DeletePivotPayload = z.infer<typeof deletePivotPayloadSchema>;

export type DeletePivotResponse =
  | { success: true; data: DestroyDataModelReport }
  | { success: false; errors: unknown[] };

const endpoint = getRoute('/ressources/data/deletePivot');

export const useDeletePivotMutation = () => {
  return useMutation({
    mutationKey: ['data', 'delete-pivot'],
    mutationFn: async (payload: DeletePivotPayload): Promise<DeletePivotResponse> => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
