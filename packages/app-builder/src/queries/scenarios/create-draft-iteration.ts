import { createDraftIterationFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateDraftIterationMutation = (scenarioId: string, iterationId: string) => {
  const createDraftIteration = useServerFn(createDraftIterationFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'create-draft', scenarioId, iterationId],
    mutationFn: async () => createDraftIteration({ data: { scenarioId, iterationId } }),
  });
};
