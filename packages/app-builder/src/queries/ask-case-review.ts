import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

export function useEnqueueCaseReviewMutation() {
  return useMutation({
    mutationFn: async (caseId: string) => {
      await fetch(getRoute('/ressources/cases/:caseId/enqueue-review', { caseId }), {
        method: 'POST',
      });
    },
  });
}
