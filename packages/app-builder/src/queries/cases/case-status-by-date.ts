import { CaseStatusByDateResponse } from '@app-builder/models/analytics/cases-status-by-date';
import { getCaseStatusByDateFn } from '@app-builder/server-fns/analytics';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

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
  const getCaseStatusByDate = useServerFn(getCaseStatusByDateFn);

  return useQuery({
    queryKey: ['case-status-by-date'],
    queryFn: async () => {
      const result = await getCaseStatusByDate({ data: buildCaseStatusDateRange() });
      return result.casesStatusByDate as CaseStatusByDateResponse[];
    },
    placeholderData: keepPreviousData,
  });
};
