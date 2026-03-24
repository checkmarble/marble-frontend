import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { useInvalidateCaseDecisions } from '@app-builder/queries/cases/list-decisions';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const reviewDecisionPayloadSchema = z.object({
  decisionId: z.string(),
  reviewComment: z.string(),
  reviewStatus: z.enum(nonPendingReviewStatuses),
});

export type ReviewDecisionPayload = z.infer<typeof reviewDecisionPayloadSchema>;

const endpoint = getRoute('/ressources/cases/review-decision');

export const useReviewDecisionMutation = () => {
  const invalidateCaseDecisions = useInvalidateCaseDecisions();

  return useMutation({
    mutationKey: ['cases', 'review-decision'],
    mutationFn: async (payload: ReviewDecisionPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      return response.json();
    },
    onSuccess: () => {
      invalidateCaseDecisions();
    },
  });
};
