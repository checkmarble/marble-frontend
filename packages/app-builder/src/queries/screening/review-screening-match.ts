import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const reviewScreeningMatchPayloadSchema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
  whitelist: z.boolean().optional(),
});

export type ReviewScreeningMatchPayload = z.infer<typeof reviewScreeningMatchPayloadSchema>;

const endpoint = getRoute('/ressources/cases/review-screening-match');

export const useReviewScreeningMatchMutation = () => {
  return useMutation({
    mutationFn: async (payload: ReviewScreeningMatchPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
