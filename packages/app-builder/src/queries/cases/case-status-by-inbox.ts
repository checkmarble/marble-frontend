import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { CaseStatusByInboxResponse } from '@app-builder/models/analytics/case-status-by-inbox';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/analytics/case-status-by-inbox');

export const useCaseStatusByInbox = () => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['case-status-by-inbox'],
    queryFn: async () => {
      const response = await fetch(endpoint, { method: 'GET' });
      const result = (await response.json()) as
        | { redirectTo: string }
        | { caseStatusByInbox: CaseStatusByInboxResponse[] };

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result.caseStatusByInbox;
    },
    placeholderData: keepPreviousData,
  });
};
