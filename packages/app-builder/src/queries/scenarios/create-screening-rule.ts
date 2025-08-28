import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';

const endpoint = (scenarioId: string, iterationId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/:iterationId/sanctions/create', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    iterationId: fromUUIDtoSUUID(iterationId),
  });

export const useCreateScreeningRuleMutation = (scenarioId: string, iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'create-screening-rule', scenarioId, iterationId],
    mutationFn: async () => {
      const response = await fetch(endpoint(scenarioId, iterationId), {
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
