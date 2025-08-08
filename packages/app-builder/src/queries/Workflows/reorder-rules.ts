import { type Rule } from '@app-builder/models/scenario/workflow';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ReorderRulesInput = {
  scenarioId: string;
  ruleIds: string[];
};

export function useReorderRulesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scenarioId, ruleIds }: ReorderRulesInput) => {
      // Optimistically update the UI
      queryClient.setQueryData(['workflow-rules', scenarioId], (oldData: { workflow: Rule[] }) => {
        if (!oldData?.workflow) return oldData;

        // Reorder the workflow rules according to the new order
        const ruleMap = new Map(oldData.workflow.map((rule) => [rule.id, rule]));
        const reorderedRules = ruleIds.map((id: string) => ruleMap.get(id)).filter(Boolean);

        return {
          ...oldData,
          workflow: reorderedRules,
        };
      });

      const response = await fetch(`/ressources/workflows/${scenarioId}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ruleIds }),
      });

      if (!response.ok) {
        // invalidate the query
        queryClient.invalidateQueries({ queryKey: ['workflow-rules', scenarioId] });
        throw new Error('Failed to reorder rules');
      }

      return { scenarioId, ruleIds };
    },
    onSuccess: ({ scenarioId }: ReorderRulesInput) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules', scenarioId] });
    },
  });
}
