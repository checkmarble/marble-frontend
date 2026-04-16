import { type PrepareIterationPayload, prepareIterationPayloadSchema } from '@app-builder/schemas/scenarios';
import { prepareIterationFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { prepareIterationPayloadSchema, type PrepareIterationPayload };

export const usePrepareIterationMutation = (scenarioId: string, iterationId: string) => {
  const prepareIteration = useServerFn(prepareIterationFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'prepare', scenarioId, iterationId],
    mutationFn: async (payload: PrepareIterationPayload) =>
      prepareIteration({ data: { ...payload, scenarioId, iterationId } }),
  });
};
