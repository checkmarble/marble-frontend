import { renameWorkflowRuleFn } from '@app-builder/server-fns/workflows';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

interface RenameRuleInput {
  ruleId: string;
  scenarioId: string;
  name: string;
  fallthrough: boolean;
}

export function useRenameRuleMutation() {
  const renameWorkflowRule = useServerFn(renameWorkflowRuleFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, name, fallthrough, scenarioId }: RenameRuleInput): Promise<RenameRuleInput> => {
      await renameWorkflowRule({ data: { ruleId, name, fallthrough } });
      return { ruleId, scenarioId, name, fallthrough };
    },
    onSuccess: ({ scenarioId }: RenameRuleInput) => {
      queryClient.invalidateQueries({
        queryKey: ['workflow-rules', scenarioId],
      });
    },
  });
}
