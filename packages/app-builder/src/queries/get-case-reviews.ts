import { type CaseReviewsResource } from '@app-builder/routes/ressources+/cases+/$caseId.reviews';
import { useQuery } from '@tanstack/react-query';

export function useCaseReviewsQuery(caseId: string) {
  return useQuery({
    queryKey: ['cases', caseId, 'reviews'],
    queryFn: async () => {
      const res = await fetch(`/ressources/cases/${caseId}/reviews`);
      const data = (await res.json()) as CaseReviewsResource;
      return data.reviews;
    },
  });
}
