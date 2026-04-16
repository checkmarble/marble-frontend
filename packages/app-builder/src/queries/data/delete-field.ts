import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { type DeleteFieldPayload, deleteFieldPayloadSchema } from '@app-builder/schemas/data';
import { deleteFieldFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteFieldPayloadSchema, type DeleteFieldPayload };

export type DeleteFieldResponse =
  | { success: true; data: DestroyDataModelReport }
  | { success: false; errors: string[] };

export const useDeleteFieldMutation = () => {
  const deleteField = useServerFn(deleteFieldFn);

  return useMutation({
    mutationKey: ['data', 'delete-field'],
    mutationFn: async (payload: DeleteFieldPayload): Promise<DeleteFieldResponse> =>
      deleteField({ data: payload }) as Promise<DeleteFieldResponse>,
  });
};
