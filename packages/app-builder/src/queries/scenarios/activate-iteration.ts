import { type ActivateIterationPayload, activateIterationPayloadSchema } from '@app-builder/schemas/scenarios';
import { activateIterationFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { activateIterationPayloadSchema, type ActivateIterationPayload };

export const useActivateIterationMutation = (scenarioId: string, iterationId: string) => {
  const activateIteration = useServerFn(activateIterationFn);

  return useMutation({
    mutationKey: ['scenarios', 'iterations', 'activate', scenarioId, iterationId],
    mutationFn: async (payload: ActivateIterationPayload) =>
      activateIteration({ data: { ...payload, scenarioId, iterationId } }),
  });
};
