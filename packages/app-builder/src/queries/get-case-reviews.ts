import { type CaseReviewsResource } from '@app-builder/routes/ressources+/cases+/$caseId.reviews';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (caseId: string) => getRoute('/ressources/cases/:caseId/reviews', { caseId });

export function useCaseReviewsQuery(caseId: string) {
  return useQuery({
    queryKey: ['cases', caseId, 'reviews'],
    queryFn: async () => {
      const res = await fetch(endpoint(caseId));

      const data = (await res.json()) as CaseReviewsResource;
      return data.reviews;
    },
    enabled: !!caseId,
  });
}
