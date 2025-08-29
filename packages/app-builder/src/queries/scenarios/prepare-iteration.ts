import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const prepareIterationPayloadSchema = z.object({
  activateToGoInProd: z.boolean().pipe(z.literal(true)),
  preparationIsAsync: z.boolean().pipe(z.literal(true)),
});

export type PrepareIterationPayload = z.infer<typeof prepareIterationPayloadSchema>;

const endpoint = (scenarioId: string, iterationId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/:iterationId/prepare', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    iterationId: fromUUIDtoSUUID(iterationId),
  });

export const usePrepareIterationMutation = (scenarioId: string, iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'prepare', scenarioId, iterationId],
    mutationFn: async (payload: PrepareIterationPayload) => {
      const response = await fetch(endpoint(scenarioId, iterationId), {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
