import { type EditTablePayload } from '@app-builder/schemas/data';
import { editTableFn } from '@app-builder/server-fns/data';
import { formatTableMutationError, isTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';

export const useEditTableMutation = () => {
  const editTable = useServerFn(editTableFn);

  return useMutation({
    mutationKey: ['data', 'edit-table'],
    mutationFn: async (table: EditTablePayload) => editTable({ data: table }),
    onError: (error) => {
      if (isTableMutationError(error)) {
        toast.error(formatTableMutationError(error));
      }
    },
  });
};
