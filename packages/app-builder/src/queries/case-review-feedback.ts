import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

export function useCaseReviewFeedbackMutation(caseId: string, reviewId: string | undefined) {
  return useMutation({
    mutationFn: async (reaction: 'ok' | 'ko') => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await fetch(getRoute('/ressources/cases/:caseId/review/:reviewId/feedback', { caseId, reviewId }), {
        method: 'PUT',
        body: JSON.stringify({ reaction }),
      });
    },
  });
}
