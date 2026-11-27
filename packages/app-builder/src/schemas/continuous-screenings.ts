import { SCREENING_REVIEW_COMMENT_MAX } from '@app-builder/models/screening-review';
import { z } from 'zod/v4';

export const reviewMatchPayloadSchema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
});
export type ReviewMatchPayload = z.infer<typeof reviewMatchPayloadSchema>;

export const markPendingMatchesAsNoHitPayloadSchema = z.object({
  caseId: z.uuid(),
  screeningId: z.uuid(),
  comment: z.string().max(SCREENING_REVIEW_COMMENT_MAX).optional(),
});
export type MarkPendingMatchesAsNoHitPayload = z.infer<typeof markPendingMatchesAsNoHitPayloadSchema>;
