import { type Rule } from '@app-builder/models/scenario/workflow';
import { updateWorkflowRuleFn } from '@app-builder/server-fns/workflows';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

interface UpdateRuleInput {
  rule: Rule;
  scenarioId: string;
}

export function useUpdateRuleMutation() {
  const updateWorkflowRule = useServerFn(updateWorkflowRuleFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rule, scenarioId }: UpdateRuleInput): Promise<UpdateRuleInput> => {
      await updateWorkflowRule({ data: rule });
      return { rule, scenarioId };
    },
    onSuccess: ({ scenarioId }: UpdateRuleInput) => {
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules', scenarioId],
      });
    },
  });
}
