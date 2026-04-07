import { type Rule } from '@app-builder/models/scenario/workflow';
import { reorderWorkflowsFn } from '@app-builder/server-fns/workflows';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type ReorderRulesInput = {
  scenarioId: string;
  ruleIds: string[];
};

export function useReorderRulesMutation() {
  const reorderWorkflows = useServerFn(reorderWorkflowsFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scenarioId, ruleIds }: ReorderRulesInput) => {
      queryClient.setQueryData(['workflow-rules', scenarioId], (oldData: { workflow: Rule[] }) => {
        if (!oldData?.workflow) return oldData;
        const ruleMap = new Map(oldData.workflow.map((rule) => [rule.id, rule]));
        const reorderedRules = ruleIds.map((id: string) => ruleMap.get(id)).filter(Boolean);
        return { ...oldData, workflow: reorderedRules };
      });

      try {
        await reorderWorkflows({ data: { scenarioId, ruleIds } });
      } catch {
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
