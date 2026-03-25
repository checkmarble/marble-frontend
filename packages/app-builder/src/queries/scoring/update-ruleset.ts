import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateScoringRulesetPayloadSchema = z.object({
  id: z.string().optional(),
  recordType: z.string(),
  name: z.string(),
  description: z.string().optional(),
  thresholds: z.array(z.number()).superRefine((arr, ctx) => {
    arr.forEach((val, i) => {
      if (i > 0 && val <= arr[i - 1]!) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [i] });
      }
    });
  }),
  cooldownSeconds: z.number().optional(),
  scoringIntervalSeconds: z.number().optional(),
  rules: z.array(
    z.object({
      stableId: z.string().optional(),
      name: z.string(),
      description: z.string().optional(),
      riskType: z.string(),
      ast: z.any(),
    }),
  ),
});

export type UpdateScoringRulesetPayload = z.infer<typeof updateScoringRulesetPayloadSchema>;

const endpoint = getRoute('/ressources/scoring/update-ruleset');

export const useUpdateScoringRulesetMutation = () => {
  const navigate = useAgnosticNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['scoring', 'update-ruleset'],
    mutationFn: async (payload: UpdateScoringRulesetPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return { success: true };
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scoring'] });
    },
  });
};
