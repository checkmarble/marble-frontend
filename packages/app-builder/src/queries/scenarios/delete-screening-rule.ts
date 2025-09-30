import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';

const endpoint = (scenarioId: string, iterationId: string, screeningId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/:iterationId/screenings/:screeningId/delete', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    iterationId: fromUUIDtoSUUID(iterationId),
    screeningId: fromUUIDtoSUUID(screeningId),
  });

export const useDeleteScreeningRuleMutation = (scenarioId: string, iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'delete-screening-rule', scenarioId, iterationId],
    mutationFn: async (screeningId: string) => {
      const response = await fetch(endpoint(scenarioId, iterationId, screeningId), {
        method: 'POST',
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
