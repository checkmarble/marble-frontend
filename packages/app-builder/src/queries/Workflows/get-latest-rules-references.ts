import { ScenarioRuleLatestVersion, ScenarioRuleLatestVersionMap } from '@app-builder/models/scenario/workflow';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export function useGetLatestRulesReferencesQuery(
  scenarioId: string,
): UseQueryResult<ScenarioRuleLatestVersionMap, Error> {
  return useQuery({
    queryKey: ['workflow-latest-rules-references', scenarioId],
    queryFn: async (): Promise<ScenarioRuleLatestVersionMap> => {
      const response = await fetch(`/ressources/workflows/${scenarioId}/latest-references`);
      const data = (await response.json()) as ScenarioRuleLatestVersion[];
      return new Map(data.map((rule) => [rule.stableId, rule]));
    },
    enabled: Boolean(scenarioId),
  });
}
