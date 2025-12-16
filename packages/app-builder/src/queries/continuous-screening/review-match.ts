import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const reviewMatchPayloadSchema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
});

export type ReviewMatchPayload = z.infer<typeof reviewMatchPayloadSchema>;

const endpoint = getRoute('/ressources/continuous-screening/review-match');

export const useReviewContinuousScreeningMatchMutation = () => {
  return useMutation({
    mutationFn: async (payload: ReviewMatchPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
