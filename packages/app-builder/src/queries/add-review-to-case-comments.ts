import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

export function useAddReviewToCaseCommentsMutation(caseId: string, reviewId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await fetch(
        getRoute('/ressources/cases/:caseId/review/:reviewId/add-to-case-comments', {
          caseId,
          reviewId,
        }),
        { method: 'POST' },
      );
    },
  });
}
