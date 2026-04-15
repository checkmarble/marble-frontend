import { deleteScreeningRuleFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDeleteScreeningRuleMutation = (scenarioId: string, iterationId: string) => {
  const deleteScreeningRule = useServerFn(deleteScreeningRuleFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'delete-screening-rule', scenarioId, iterationId],
    mutationFn: async (screeningId: string) => deleteScreeningRule({ data: { scenarioId, iterationId, screeningId } }),
  });
};
