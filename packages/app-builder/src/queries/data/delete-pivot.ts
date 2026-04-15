import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { type DeletePivotPayload, deletePivotPayloadSchema } from '@app-builder/schemas/data';
import { deletePivotFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deletePivotPayloadSchema, type DeletePivotPayload };

export type DeletePivotResponse =
  | { success: true; data: DestroyDataModelReport }
  | { success: false; errors: unknown[] };

export const useDeletePivotMutation = () => {
  const deletePivot = useServerFn(deletePivotFn);

  return useMutation({
    mutationKey: ['data', 'delete-pivot'],
    mutationFn: async (payload: DeletePivotPayload): Promise<DeletePivotResponse> =>
      deletePivot({ data: payload }) as Promise<DeletePivotResponse>,
  });
};
