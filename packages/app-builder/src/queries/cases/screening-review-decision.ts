import { reviewScreeningReviewMatchFn } from '@app-builder/server-fns/screening-review';
import type { ScreeningReviewDecisionInput } from '@app-builder/services/screening-review-decision';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useScreeningReviewDecisionMutation() {
  const review = useServerFn(reviewScreeningReviewMatchFn);
  return useMutation({
    mutationFn: (input: ScreeningReviewDecisionInput) => review({ data: input }),
  });
}
