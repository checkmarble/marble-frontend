import { type DeleteTablePayload } from '@app-builder/schemas/data';
import { deleteTableFn } from '@app-builder/server-fns/data';
import { formatTableMutationError, isTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';

export const useDeleteTableMutation = () => {
  const deleteTable = useServerFn(deleteTableFn);

  return useMutation({
    mutationKey: ['data', 'delete-table'],
    mutationFn: async (payload: DeleteTablePayload) => deleteTable({ data: payload }),
    onError: (error) => {
      if (isTableMutationError(error)) {
        toast.error(formatTableMutationError(error));
      }
    },
  });
};
