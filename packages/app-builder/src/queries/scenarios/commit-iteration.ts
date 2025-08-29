import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const commitIterationPayloadSchema = z.object({
  draftIsReadOnly: z.boolean().pipe(z.literal(true)),
  activateToGoInProd: z.boolean().pipe(z.literal(true)),
  changeIsImmediate: z.boolean().pipe(z.literal(true)),
});

export type CommitIterationPayload = z.infer<typeof commitIterationPayloadSchema>;

const endpoint = (scenarioId: string, iterationId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/:iterationId/commit', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    iterationId: fromUUIDtoSUUID(iterationId),
  });

export const useCommitIterationMutation = (scenarioId: string, iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'iterations', 'commit', scenarioId, iterationId],
    mutationFn: async (payload: CommitIterationPayload) => {
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
