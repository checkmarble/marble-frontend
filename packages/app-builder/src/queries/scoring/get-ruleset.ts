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
 * then fetch that version. Without ruleset_id (or if the id is unknown), loads the committed ruleset.
 */
export const useGetScoringRulesetForScoreQuery = (recordType: string, rulesetId?: string) => {
  const versionsQuery = useListScoringRulesetVersionsQuery(recordType);
  const versionNumber = rulesetId ? versionsQuery.data?.versions.find((v) => v.id === rulesetId)?.version : undefined;

  const waitingForVersion = !!rulesetId && versionsQuery.isPending;
  // Fall back to committed when ruleset_id is missing from the versions list
  const resolvedVersion = waitingForVersion ? undefined : (versionNumber ?? 'committed');

  const rulesetQuery = useGetScoringRulesetQuery(recordType, resolvedVersion, {
    enabled: !!recordType && !waitingForVersion,
  });

  return {
    ...rulesetQuery,
    isPending: waitingForVersion || rulesetQuery.isPending,
  };
};
