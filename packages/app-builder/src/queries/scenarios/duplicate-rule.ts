import { type DuplicateRulePayload, duplicateRulePayloadSchema } from '@app-builder/schemas/scenarios';
import { duplicateRuleFn } from '@app-builder/server-fns/scenarios';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { duplicateRulePayloadSchema, type DuplicateRulePayload };

export const useDuplicateRuleMutation = (scenarioId: string, iterationId: string) => {
  const duplicateRule = useServerFn(duplicateRuleFn);

  return useMutation({
    mutationKey: ['scenarios', 'iteration', 'duplicate-rule', scenarioId],
    mutationFn: async (payload: DuplicateRulePayload) =>
      duplicateRule({ data: { ...payload, scenarioId, iterationId } }),
  });
};
