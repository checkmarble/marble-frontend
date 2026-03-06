import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { type CaseReviewsResource } from '@app-builder/routes/ressources+/cases+/$caseId.reviews';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (caseId: string) => getRoute('/ressources/cases/:caseId/reviews', { caseId });

export function useCaseReviewsQuery(caseId: string) {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['cases', caseId, 'reviews'],
    queryFn: async () => {
      const res = await fetch(endpoint(caseId));
      const result = await res.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return [];
      }

      return (result as CaseReviewsResource).reviews;
    },
    enabled: !!caseId,
  });
}
