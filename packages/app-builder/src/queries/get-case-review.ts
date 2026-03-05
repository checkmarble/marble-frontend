import { type CaseReviewResource } from '@app-builder/routes/ressources+/cases+/$caseId+/review.$reviewId';
import { useQuery } from '@tanstack/react-query';

export function useCaseReviewQuery(caseId: string, reviewId: string) {
  return useQuery({
    queryKey: ['cases', caseId, 'review', reviewId],
    queryFn: async () => {
      const res = await fetch(`/ressources/cases/${caseId}/review/${reviewId}`);
      const data = (await res.json()) as CaseReviewResource;
      return data.review;
    },
    enabled: !!caseId && !!reviewId,
  });
}
