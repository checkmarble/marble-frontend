import { type MassUpdateCasesPayload, massUpdateCasesPayloadSchema } from '@app-builder/schemas/cases';
import { massUpdateCasesFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { massUpdateCasesPayloadSchema, type MassUpdateCasesPayload };

export const useMassUpdateCasesMutation = () => {
  const massUpdateCases = useServerFn(massUpdateCasesFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'mass-update'],
    mutationFn: async (payload: MassUpdateCasesPayload) => massUpdateCases({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
