import { type CaseReviewResource } from '@app-builder/routes/ressources+/cases+/$caseId+/review.$reviewId';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (caseId: string, reviewId: string) =>
  getRoute('/ressources/cases/:caseId/review/:reviewId', { caseId, reviewId });

export function useCaseReviewQuery(caseId: string, reviewId: string) {
  return useQuery({
    queryKey: ['cases', caseId, 'review', reviewId],
    queryFn: async () => {
      const res = await fetch(endpoint(caseId, reviewId));

      const data = (await res.json()) as CaseReviewResource;
      return data.review;
    },
    enabled: !!caseId && !!reviewId,
  });
}
