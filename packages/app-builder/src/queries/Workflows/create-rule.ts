import { createWorkflowRuleFn } from '@app-builder/server-fns/workflows';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

type CreateRuleInput = {
  scenarioId: string;
  name: string;
  fallthrough: boolean;
};

export function useCreateRuleMutation() {
  const createWorkflowRule = useServerFn(createWorkflowRuleFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRuleInput): Promise<CreateRuleInput> => {
      await createWorkflowRule({ data: input });
      return input;
    },
    onSuccess: ({ scenarioId }: CreateRuleInput) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-rules', scenarioId] });
    },
  });
}
