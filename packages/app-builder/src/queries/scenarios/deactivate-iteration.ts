import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deactivateIterationPayloadSchema = z.object({
  stopOperating: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});

export type DeactivateIterationPayload = z.infer<typeof deactivateIterationPayloadSchema>;

const endpoint = (scenarioId: string, iterationId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/:iterationId/deactivate', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    iterationId: fromUUIDtoSUUID(iterationId),
  });

export const useDeactivateIterationMutation = (scenarioId: string, iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'deactivate', scenarioId, iterationId],
    mutationFn: async (payload: DeactivateIterationPayload) => {
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
