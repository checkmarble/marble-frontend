import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = (caseId: string) => getRoute('/ressources/cases/:caseId/enqueue-review', { caseId });

export function useEnqueueCaseReviewMutation() {
  return useMutation({
    mutationFn: async (caseId: string) => {
      await fetch(endpoint(caseId), {
        method: 'POST',
      });
    },
  });
}
