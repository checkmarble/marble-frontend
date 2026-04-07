import { type DeactivateIterationPayload, deactivateIterationPayloadSchema } from '@app-builder/schemas/scenarios';
import { deactivateIterationFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deactivateIterationPayloadSchema, type DeactivateIterationPayload };

export const useDeactivateIterationMutation = (scenarioId: string, iterationId: string) => {
  const deactivateIteration = useServerFn(deactivateIterationFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'deactivate', scenarioId, iterationId],
    mutationFn: async (payload: DeactivateIterationPayload) =>
      deactivateIteration({ data: { ...payload, scenarioId, iterationId } }),
  });
};
