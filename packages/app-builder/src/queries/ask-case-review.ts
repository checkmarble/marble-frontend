import { useMutation } from '@tanstack/react-query';

export function useAskCaseReviewMutation() {
  return useMutation({
    mutationFn: async (caseId: string) => {
      await fetch(`/ressources/cases/${caseId}/ask-review`, {
        method: 'POST',
      });
    },
  });
}
