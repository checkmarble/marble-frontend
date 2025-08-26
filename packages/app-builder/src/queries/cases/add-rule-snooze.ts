import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const durationUnitOptions = ['hours', 'days', 'weeks'] as const;

export const addRuleSnoozePayloadSchema = z.object({
  decisionId: z.string(),
  ruleId: z.string(),
  comment: z.string().optional(),
  durationValue: z.number().min(1),
  durationUnit: z.enum(durationUnitOptions),
});

export type AddRuleSnoozePayload = z.infer<typeof addRuleSnoozePayloadSchema>;

const endpoint = getRoute('/ressources/cases/add-rule-snooze');

export const useAddRuleSnoozeMutation = () => {
  return useMutation({
    mutationKey: ['case', 'add-rule-snooze'],
    mutationFn: async (payload: AddRuleSnoozePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
