import { deleteWorkflowRuleFn } from '@app-builder/server-fns/workflows';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

interface DeleteRuleInput {
  ruleId: string;
  scenarioId: string;
}

export function useDeleteRuleMutation() {
  const deleteWorkflowRule = useServerFn(deleteWorkflowRuleFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, scenarioId }: DeleteRuleInput): Promise<DeleteRuleInput> => {
      await deleteWorkflowRule({ data: { ruleId } });
      return { ruleId, scenarioId };
    },
    onSuccess: ({ scenarioId }: DeleteRuleInput) => {
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules', scenarioId],
      });
    },
  });
}
