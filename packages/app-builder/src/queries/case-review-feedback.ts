import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const endpoint = (caseId: string, reviewId: string) =>
  getRoute('/ressources/cases/:caseId/review/:reviewId/feedback', { caseId, reviewId });

export function useCaseReviewFeedbackMutation(caseId: string, reviewId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reaction: 'ok' | 'ko') => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await fetch(endpoint(caseId, reviewId), {
        method: 'PUT',
        body: JSON.stringify({ reaction }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId, 'reviews'] });
    },
  });
}
