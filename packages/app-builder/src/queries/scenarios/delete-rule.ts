import { type DeleteRulePayload, deleteRulePayloadSchema } from '@app-builder/schemas/scenarios';
import { deleteRuleFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteRulePayloadSchema, type DeleteRulePayload };

export const useDeleteRuleMutation = (scenarioId: string, iterationId: string) => {
  const deleteRule = useServerFn(deleteRuleFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'delete-rule', scenarioId],
    mutationFn: async (payload: DeleteRulePayload) => deleteRule({ data: { ...payload, scenarioId, iterationId } }),
  });
};
