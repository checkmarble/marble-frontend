import {
  ScenarioRuleLatestVersion,
  ScenarioRuleLatestVersionMap,
} from '@app-builder/models/scenario/workflow';
import type { AppRouter } from '@app-builder/server/trpc/root';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: '/api/trpc' })],
});

export function useGetLatestRulesReferencesQuery(
  scenarioId: string,
): UseQueryResult<ScenarioRuleLatestVersionMap, Error> {
  return useQuery({
    queryKey: ['workflow-latest-rules-references', scenarioId],
    queryFn: async (): Promise<ScenarioRuleLatestVersionMap> => {
      const data = await client.workflow.getLatestReferences.query({ scenarioId });
      return new Map(
        (data as ScenarioRuleLatestVersion[]).map((rule: ScenarioRuleLatestVersion) => [
          rule.stableId,
          rule,
        ]),
      );
    },
    enabled: Boolean(scenarioId),
  });
}
