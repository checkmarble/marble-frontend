import { CaseReviewResource } from '@app-builder/routes/ressources+/cases+/$caseId.ask-review';
import { useMutation } from '@tanstack/react-query';

export function useAskCaseReviewMutation() {
  return useMutation({
    mutationFn: async (caseId: string) => {
      const response = await fetch(`/ressources/cases/${caseId}/ask-review`, { method: 'POST' });
      return response.json() as Promise<CaseReviewResource>;
    },
  });
}
