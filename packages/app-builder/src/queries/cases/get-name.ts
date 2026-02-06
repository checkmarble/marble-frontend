import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (caseId: string) => getRoute('/ressources/cases/:caseId/get-name', { caseId });

export const useGetCaseNameQuery = (caseId: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['cases', 'get-name', caseId],
    queryFn: async () => {
      const response = await fetch(endpoint(caseId));
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return { name: null };
      }

      return result as { name: string };
    },
  });
};
