import { ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useQuery } from '@tanstack/react-query';

const endpoint = (scenarioIterationId: string) =>
  getRoute('/ressources/scenarios/iteration/:iterationId/get-rules', {
    iterationId: fromUUIDtoSUUID(scenarioIterationId),
  });

export function useScenarioIterationRules(scenarioIterationId: string) {
  return useQuery({
    queryKey: ['scenario-iteration-rules', scenarioIterationId],
    queryFn: async () => {
      const response = await fetch(endpoint(scenarioIterationId));
      return response.json() as Promise<{ rules: ScenarioIterationRule[] }>;
    },
  });
}
