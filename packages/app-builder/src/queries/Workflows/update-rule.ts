import { type Rule } from '@app-builder/models/scenario/workflow';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateRuleInput {
  ruleId: string;
  scenarioId: string;
  rule: Rule;
}

export function useUpdateRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, scenarioId, rule }: UpdateRuleInput): Promise<Rule> => {
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
    onSuccess: (updatedRule, { scenarioId }) => {
      // Invalidate and refetch the workflow rules
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules', scenarioId],
      });
    },
  });
}
