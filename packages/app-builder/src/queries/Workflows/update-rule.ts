import { type Rule } from '@app-builder/models/scenario/workflow';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Rule): Promise<Rule> => {
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
