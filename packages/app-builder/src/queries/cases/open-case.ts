import { type OpenCasePayload, openCasePayloadSchema } from '@app-builder/schemas/cases';
import { openCaseFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { openCasePayloadSchema, type OpenCasePayload };

export const useOpenCaseMutation = () => {
  const openCase = useServerFn(openCaseFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'open-case'],
    mutationFn: async (payload: OpenCasePayload) => openCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
