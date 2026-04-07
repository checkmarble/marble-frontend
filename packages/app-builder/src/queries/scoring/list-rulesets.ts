import { ScoringRuleset } from '@app-builder/models/scoring';
import { listRulesetsFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useListScoringRulesetsQuery = () => {
  const listRulesets = useServerFn(listRulesetsFn);

  return useQuery({
    queryKey: ['scoring', 'rulesets'],
    queryFn: async () => {
      const result = await listRulesets();
      return result as { rulesets: ScoringRuleset[] };
    },
  });
};
