import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';

const endpoint = (scenarioId: string, testRunId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/testrun/:testRunId/cancel', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
    testRunId: fromUUIDtoSUUID(testRunId),
  });

export const useCancelTestRunMutation = (scenarioId: string, testRunId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'testrun', 'cancel', scenarioId, testRunId],
    mutationFn: async () => {
      const response = await fetch(endpoint(scenarioId, testRunId), {
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
