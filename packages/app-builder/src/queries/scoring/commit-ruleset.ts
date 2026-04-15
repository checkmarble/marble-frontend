import { commitScoringRulesetFn } from '@app-builder/server-fns/scoring';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCommitScoringRulesetMutation = () => {
  const commitScoringRuleset = useServerFn(commitScoringRulesetFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['scoring', 'commit-ruleset'],
    mutationFn: async (recordType: string) => {
      await commitScoringRuleset({ data: { recordType } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring'] });
    },
  });
};
