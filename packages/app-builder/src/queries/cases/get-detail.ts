import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { CaseDetail } from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (caseId: string) => getRoute('/ressources/cases/:caseId/get-detail', { caseId });

export const useGetCaseDetailQuery = (caseId: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['cases', caseId, 'get-details'],
    queryFn: async () => {
      const response = await fetch(endpoint(caseId));
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return { caseDetail: null };
      }

      return result as { caseDetail: CaseDetail };
    },
  });
};
