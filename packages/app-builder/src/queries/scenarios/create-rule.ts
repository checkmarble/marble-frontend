import { createRuleFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateRuleMutation = (scenarioId: string, iterationId: string) => {
  const createRule = useServerFn(createRuleFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'create-rule', scenarioId],
    mutationFn: async () => createRule({ data: { scenarioId, iterationId } }),
  });
};
