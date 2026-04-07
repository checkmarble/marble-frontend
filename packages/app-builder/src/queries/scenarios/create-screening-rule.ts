import { createScreeningRuleFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateScreeningRuleMutation = (scenarioId: string, iterationId: string) => {
  const createScreeningRule = useServerFn(createScreeningRuleFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'create-screening-rule', scenarioId, iterationId],
    mutationFn: async () => createScreeningRule({ data: { scenarioId, iterationId } }),
  });
};
