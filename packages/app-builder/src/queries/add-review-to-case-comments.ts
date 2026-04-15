import { addReviewToCaseCommentsFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useAddReviewToCaseCommentsMutation(caseId: string, reviewId: string | undefined) {
  const queryClient = useQueryClient();
  const addReviewToCaseComments = useServerFn(addReviewToCaseCommentsFn);

  return useMutation({
    mutationFn: async () => {
      if (!reviewId) {
        throw new Error('Review ID is required');
      }

      await addReviewToCaseComments({ data: { caseId, reviewId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', caseId, 'reviews'] });
    },
  });
}
