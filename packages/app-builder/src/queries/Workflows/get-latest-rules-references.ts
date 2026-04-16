import { ScenarioRuleLatestVersion, ScenarioRuleLatestVersionMap } from '@app-builder/models/scenario/workflow';
import { getWorkflowLatestReferencesFn } from '@app-builder/server-fns/workflows';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useGetLatestRulesReferencesQuery(
  scenarioId: string,
): UseQueryResult<ScenarioRuleLatestVersionMap, Error> {
  const getWorkflowLatestReferences = useServerFn(getWorkflowLatestReferencesFn);

  return useQuery({
    queryKey: ['workflow-latest-rules-references', scenarioId],
    queryFn: async (): Promise<ScenarioRuleLatestVersionMap> => {
      const data = (await getWorkflowLatestReferences({ data: { scenarioId } })) as ScenarioRuleLatestVersion[];
      return new Map(data.map((rule) => [rule.stableId, rule]));
    },
    enabled: Boolean(scenarioId),
  });
}
