import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const endpoint = (caseId: string, reviewId: string) =>
  getRoute('/ressources/cases/:caseId/review/:reviewId/add-to-case-comments', { caseId, reviewId });

export function useAddReviewToCaseCommentsMutation(caseId: string, reviewId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await fetch(endpoint(caseId, reviewId), { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId, 'reviews'] });
    },
  });
}
