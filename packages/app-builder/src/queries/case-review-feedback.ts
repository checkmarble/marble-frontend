import { useMutation } from '@tanstack/react-query';

export function useCaseReviewFeedbackMutation(caseId: string, reviewId: string | undefined) {
  return useMutation({
    mutationFn: async (reaction: 'ok' | 'ko') => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await fetch(`/ressources/cases/${caseId}/review/${reviewId}/feedback`, {
        method: 'PUT',
        body: JSON.stringify({
          reaction,
        }),
      });
    },
  });
}
