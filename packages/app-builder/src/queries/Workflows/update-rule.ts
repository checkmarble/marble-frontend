import { type Rule } from '@app-builder/models/scenario/workflow';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateRuleInput {
  rule: Rule;
  scenarioId: string;
}

export function useUpdateRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rule, scenarioId }: UpdateRuleInput): Promise<UpdateRuleInput> => {
      const response = await fetch(`/ressources/workflows/rule/${rule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error('Failed to update rule');
      }

      return { rule, scenarioId };
    },
    onSuccess: ({ scenarioId }: UpdateRuleInput) => {
      // Invalidate and refetch the workflow rules
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules', scenarioId],
      });
    },
  });
}
