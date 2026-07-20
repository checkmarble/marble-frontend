import { type ScoringRulesetWithRules } from '@app-builder/models/scoring';
import { useListScoringRulesetVersionsQuery } from '@app-builder/queries/scoring/list-ruleset-versions';
import { getScoringRulesetFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetScoringRulesetQuery = (
  recordType: string,
  version?: string | number,
  options?: { enabled?: boolean },
) => {
  const getScoringRuleset = useServerFn(getScoringRulesetFn);
  const resolvedVersion = version ?? 'committed';

  return useQuery({
    queryKey: ['scoring', 'ruleset', recordType, resolvedVersion],
    queryFn: () =>
      getScoringRuleset({ data: { recordType, version: resolvedVersion } }) as Promise<{
        ruleset: ScoringRulesetWithRules;
      }>,
    enabled: !!recordType && (options?.enabled ?? true),
  });
};

/**
 * Load the ruleset used for a score: resolve ruleset_id → version number via the versions list,
 * then fetch that version. Without ruleset_id, loads the committed (latest) ruleset.
 */
export const useGetScoringRulesetForScoreQuery = (recordType: string, rulesetId?: string) => {
  const versionsQuery = useListScoringRulesetVersionsQuery(recordType);
  const versionNumber = rulesetId ? versionsQuery.data?.versions.find((v) => v.id === rulesetId)?.version : undefined;

  const waitingForVersion = !!rulesetId && versionsQuery.isPending;
  const versionNotFound = !!rulesetId && versionsQuery.isSuccess && versionNumber === undefined;

  const rulesetQuery = useGetScoringRulesetQuery(recordType, versionNumber, {
    enabled: !!recordType && !waitingForVersion && !versionNotFound,
  });

  return {
    ...rulesetQuery,
    isPending: waitingForVersion || rulesetQuery.isPending,
    data: versionNotFound ? undefined : rulesetQuery.data,
  };
};
