import { type AddRuleSnoozePayload, addRuleSnoozePayloadSchema, durationUnitOptions } from '@app-builder/schemas/cases';
import { addRuleSnoozeFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { addRuleSnoozePayloadSchema, durationUnitOptions, type AddRuleSnoozePayload };

export const useAddRuleSnoozeMutation = () => {
  const addRuleSnooze = useServerFn(addRuleSnoozeFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'add-rule-snooze'],
    mutationFn: async (payload: AddRuleSnoozePayload) => addRuleSnooze({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
