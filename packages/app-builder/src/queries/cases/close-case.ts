import { type CloseCasePayload, closeCasePayloadSchema } from '@app-builder/schemas/cases';
import { closeCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type CloseCasePayload, closeCasePayloadSchema };

export const useCloseCaseMutation = () => {
  const closeCase = useServerFn(closeCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'close-case'],
    mutationFn: async (payload: CloseCasePayload) => closeCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
