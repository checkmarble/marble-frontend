import { useMutation, useQueryClient } from '@tanstack/react-query';

interface RenameRuleInput {
  ruleId: string;
  scenarioId: string;
  name: string;
  fallthrough: boolean;
}

export function useRenameRuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, name, fallthrough, scenarioId }: RenameRuleInput): Promise<RenameRuleInput> => {
      const response = await fetch(`/ressources/workflows/rule/${ruleId}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, fallthrough }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename rule');
      }

      return { ruleId, scenarioId, name, fallthrough };
    },
    onSuccess: ({ scenarioId }: RenameRuleInput) => {
      // Invalidate and refetch workflow rules after successful rename
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules', scenarioId],
      });
    },
  });
}
