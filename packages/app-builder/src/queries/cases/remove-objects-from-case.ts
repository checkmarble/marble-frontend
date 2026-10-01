import { type RemoveObjectsFromCasePayload } from '@app-builder/schemas/cases';
import { removeObjectsFromCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';

export const useRemoveObjectsFromCaseMutation = () => {
  const removeObjectsFromCase = useServerFn(removeObjectsFromCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'remove-objects-from-case'],
    mutationFn: async (payload: RemoveObjectsFromCasePayload) => removeObjectsFromCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
