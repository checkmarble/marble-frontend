import { deleteWorkflowConditionFn } from '@app-builder/server-fns/workflows';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type DeleteConditionInput = {
  ruleId: string;
  conditionId: string;
  scenarioId: string;
};

export function useDeleteConditionMutation() {
  const deleteWorkflowCondition = useServerFn(deleteWorkflowConditionFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, conditionId, scenarioId }: DeleteConditionInput) => {
      await deleteWorkflowCondition({ data: { ruleId, conditionId } });
      return { ruleId, conditionId, scenarioId };
    },
    onSuccess: ({ scenarioId }: DeleteConditionInput) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules', scenarioId] });
    },
  });
}
