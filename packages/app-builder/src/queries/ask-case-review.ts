import { useMutation } from '@tanstack/react-query';

export function useEnqueueCaseReviewMutation() {
  return useMutation({
    mutationFn: async (caseId: string) => {
      await fetch(`/ressources/cases/${caseId}/enqueue-review`, {
        method: 'POST',
      });
    },
  });
}
