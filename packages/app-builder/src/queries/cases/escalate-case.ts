import { type EscalateCasePayload, escalateCasePayloadSchema } from '@app-builder/schemas/cases';
import { escalateCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { escalateCasePayloadSchema };

export const useEscalateCaseMutation = () => {
  const escalateCase = useServerFn(escalateCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'escalate-case'],
    mutationFn: async (payload: EscalateCasePayload) => escalateCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
