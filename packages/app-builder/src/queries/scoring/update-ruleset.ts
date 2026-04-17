import { type UpdateScoringRulesetPayload } from '@app-builder/schemas/user-scoring';
import { updateScoringRulesetFn } from '@app-builder/server-fns/scoring';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUpdateScoringRulesetMutation = () => {
  const updateScoringRuleset = useServerFn(updateScoringRulesetFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['scoring', 'update-ruleset'],
    mutationFn: async (payload: UpdateScoringRulesetPayload) => {
      return updateScoringRuleset({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring'] });
    },
  });
};
