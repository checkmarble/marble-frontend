import { useMutation } from '@tanstack/react-query';

export function useAddReviewToCaseCommentsMutation(caseId: string, reviewId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await fetch(`/ressources/cases/${caseId}/review/${reviewId}/add-to-case-comments`, {
        method: 'POST',
      });
    },
  });
}
