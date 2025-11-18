import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { CaseStatusByDateResponse } from '@app-builder/models/analytics/cases-status-by-date';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/analytics/case-status-by-date');

export const useCaseStatusByDate = () => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['case-status-by-date'],
    queryFn: async () => {
      const response = await fetch(endpoint, { method: 'GET' });
      const result = (await response.json()) as
        | { redirectTo: string }
        | { casesStatusByDate: CaseStatusByDateResponse[] };

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result.casesStatusByDate;
    },
    placeholderData: keepPreviousData,
  });
};
