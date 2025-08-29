import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const activateIterationPayloadSchema = z.object({
  willBeLive: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});

export type ActivateIterationPayload = z.infer<typeof activateIterationPayloadSchema>;

const endpoint = (scenarioId: string, iterationId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/:iterationId/activate', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    iterationId: fromUUIDtoSUUID(iterationId),
  });

export const useActivateIterationMutation = (scenarioId: string, iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'iterations', 'activate', scenarioId, iterationId],
    mutationFn: async (payload: ActivateIterationPayload) => {
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
