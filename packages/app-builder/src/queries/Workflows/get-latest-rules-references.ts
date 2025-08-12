import { type ScenarioRuleLatestVersion } from '@app-builder/models/scenario/workflow';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export function useGetLatestRulesReferencesQuery(
  scenarioId: string,
): UseQueryResult<ScenarioRuleLatestVersion[], Error> {
  return useQuery({
    queryKey: ['workflow-latest-rules-references', scenarioId],
    queryFn: async (): Promise<ScenarioRuleLatestVersion[]> => {
      const response = await fetch(`/ressources/workflows/${scenarioId}/latest-references`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest rules references');
      }
      console.log('response', response);
      const data = (await response.json()) as ScenarioRuleLatestVersion[];
      return data;
    },
    enabled: Boolean(scenarioId),
  });
}
