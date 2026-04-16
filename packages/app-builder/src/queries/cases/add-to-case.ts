import {
  type AddToCasePayload,
  addToCasePayloadSchema,
  existingCaseSchema,
  newCaseSchema,
} from '@app-builder/schemas/cases';
import { addToCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { addToCasePayloadSchema, type AddToCasePayload, existingCaseSchema, newCaseSchema };

export const useAddToCaseMutation = () => {
  const addToCase = useServerFn(addToCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'add-to-case'],
    mutationFn: async (payload: AddToCasePayload) => addToCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
