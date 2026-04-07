import { useInvalidateCaseDecisions } from '@app-builder/queries/cases/list-decisions';
import { type ReviewDecisionPayload, reviewDecisionPayloadSchema } from '@app-builder/schemas/cases';
import { reviewDecisionFn } from '@app-builder/server-fns/cases';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { reviewDecisionPayloadSchema, type ReviewDecisionPayload };

export const useReviewDecisionMutation = () => {
  const reviewDecision = useServerFn(reviewDecisionFn);
  const invalidateCaseDecisions = useInvalidateCaseDecisions();

  return useMutation({
    mutationKey: ['cases', 'review-decision'],
    mutationFn: async (payload: ReviewDecisionPayload) => reviewDecision({ data: payload }),
    onSuccess: () => {
      invalidateCaseDecisions();
    },
  });
};
