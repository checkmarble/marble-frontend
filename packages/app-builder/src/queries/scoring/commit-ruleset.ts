import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/scoring/commit-ruleset');

export const useCommitScoringRulesetMutation = () => {
  const navigate = useAgnosticNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['scoring', 'commit-ruleset'],
    mutationFn: async (recordType: string) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ recordType }),
      });
      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring'] });
    },
  });
};
