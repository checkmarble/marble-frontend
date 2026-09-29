import { type AddObjectsToCasePayload } from '@app-builder/schemas/cases';
import { addObjectsToCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import toast from 'react-hot-toast';

export const useAddObjectsToCaseMutation = () => {
  const addObjectsToCase = useServerFn(addObjectsToCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'add-objects-to-case'],
    mutationFn: async (payload: AddObjectsToCasePayload) => addObjectsToCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
