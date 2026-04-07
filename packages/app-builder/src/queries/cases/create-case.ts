import { type CreateCasePayload, createCasePayloadSchema } from '@app-builder/schemas/cases';
import { createCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createCasePayloadSchema, type CreateCasePayload };

export const useCreateCaseMutation = () => {
  const createCase = useServerFn(createCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'create-case'],
    mutationFn: async (payload: CreateCasePayload) => createCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
