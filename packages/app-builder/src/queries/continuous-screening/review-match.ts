import { reviewContinuousScreeningMatchFn } from '@app-builder/server-fns/continuous-screening';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const reviewMatchPayloadSchema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
});

export type ReviewMatchPayload = z.infer<typeof reviewMatchPayloadSchema>;

export const useReviewContinuousScreeningMatchMutation = () => {
  const reviewContinuousScreeningMatch = useServerFn(reviewContinuousScreeningMatchFn);

  return useMutation({
    mutationFn: async (payload: ReviewMatchPayload) => {
      await reviewContinuousScreeningMatch({ data: payload });
    },
  });
};
