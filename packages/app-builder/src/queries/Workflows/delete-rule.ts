import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteRuleInput {
  ruleId: string;
  scenarioId: string;
}

export function useDeleteRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, scenarioId }: DeleteRuleInput): Promise<void> => {
      const response = await fetch(`/ressources/workflows/rule/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete rule');
      }
    },
    onSuccess: () => {
      // Invalidate and refetch workflow rules after successful deletion
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules'],
      });
    },
  });
}
