import { type ScoringRulesetWithRules } from '@app-builder/models/scoring';
import { getScoringRulesetFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetScoringRulesetQuery = (recordType: string) => {
  const getScoringRuleset = useServerFn(getScoringRulesetFn);

  return useQuery({
    queryKey: ['scoring', 'ruleset', recordType],
    queryFn: () => getScoringRuleset({ data: { recordType } }) as Promise<{ ruleset: ScoringRulesetWithRules }>,
    enabled: !!recordType,
  });
};
