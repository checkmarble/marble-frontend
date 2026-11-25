import { addCaseReviewFeedbackFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useCaseReviewFeedbackMutation(caseId: string, reviewId: string | undefined) {
  const queryClient = useQueryClient();
  const addCaseReviewFeedback = useServerFn(addCaseReviewFeedbackFn);

  return useMutation({
    mutationFn: async (reaction: 'ok' | 'ko') => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await addCaseReviewFeedback({ data: { caseId, reviewId, reaction } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId, 'reviews'] });
    },
  });
}
