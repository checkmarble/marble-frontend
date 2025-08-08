import { useMutation, useQueryClient } from '@tanstack/react-query';

type DeleteConditionInput = {
  ruleId: string;
  conditionId: string;
  scenarioId: string;
};

export function useDeleteConditionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, conditionId, scenarioId }: DeleteConditionInput) => {
      const response = await fetch(
        `/ressources/workflows/rule/${ruleId}/condition/${conditionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scenarioId }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete condition');
      }

      return { ruleId, conditionId, scenarioId };
    },
    onSuccess: ({ scenarioId }: DeleteConditionInput) => {
      // Invalidate and refetch the workflow rules
      queryClient.invalidateQueries({ queryKey: ['workflow-rules', scenarioId] });
    },
  });
}
