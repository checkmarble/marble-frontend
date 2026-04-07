import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { CaseStatusByDateResponse } from '@app-builder/models/analytics/cases-status-by-date';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

function buildCaseStatusDateRange() {
  const now = new Date();
  const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const tenDaysAgo = new Date(todayMidnight.getTime() - 10 * 24 * 60 * 60 * 1000);
  const tomorrowMidnight = new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000);
  return {
    start: tenDaysAgo.toISOString(),
    end: tomorrowMidnight.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export const useCaseStatusByDate = () => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['case-status-by-date'],
    queryFn: async () => {
      const endpoint = getRoute('/ressources/analytics/case-status-by-date');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildCaseStatusDateRange()),
      });
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
