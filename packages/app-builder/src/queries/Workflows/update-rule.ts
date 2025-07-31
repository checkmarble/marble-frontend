import { type Rule } from '@app-builder/models/scenario/workflow';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateRuleInput {
  ruleId: string;
  rule: Rule;
  scenarioId: string;
}

export function useUpdateRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, rule, scenarioId }: UpdateRuleInput): Promise<Rule> => {
      const response = await fetch(`/ressources/workflows/rule/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rule, scenarioId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rule');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the workflow rules
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules'],
      });
    },
  });
}
