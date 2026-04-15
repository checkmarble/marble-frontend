import { z } from 'zod/v4';

export const reviewMatchPayloadSchema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
});
export type ReviewMatchPayload = z.infer<typeof reviewMatchPayloadSchema>;
