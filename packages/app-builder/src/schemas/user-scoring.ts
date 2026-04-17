import { z } from 'zod/v4';

export const updateScoringRulesetPayloadSchema = z.object({
  id: z.string().optional(),
  recordType: z.string().nonempty(),
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

export const updateScoringSettingsPayloadSchema = z.object({
  maxRiskLevel: z.number(),
});
export type UpdateScoringSettingsPayload = z.infer<typeof updateScoringSettingsPayloadSchema>;
