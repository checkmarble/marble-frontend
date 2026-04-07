import { ScoringRuleset } from '@app-builder/models/scoring';
import { listRulesetVersionsFn } from '@app-builder/server-fns/scoring';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useListScoringRulesetVersionsQuery = (recordType: string) => {
  const listRulesetVersions = useServerFn(listRulesetVersionsFn);

  return useQuery({
    queryKey: ['scoring', 'ruleset-versions', recordType],
    queryFn: async () => {
      const result = await listRulesetVersions({ data: { recordType } });
      return result as { versions: ScoringRuleset[] };
    },
    enabled: !!recordType,
  });
};
