import { CreateTableValue } from '@app-builder/schemas/data';
import { createTableFn } from '@app-builder/server-fns/data';
import { formatTableMutationError, isTableMutationError } from '@app-builder/services/data/table-mutation-errors';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';

export const useCreateTableMutation = () => {
  const createTable = useServerFn(createTableFn);

  return useMutation({
    mutationKey: ['data', 'create-table'],
    mutationFn: async (table: CreateTableValue) => createTable({ data: table }),
    onError: (error: unknown) => {
      if (isTableMutationError(error)) {
        toast.error(formatTableMutationError(error));
      }
    },
  });
};
