import { CaseStatusByInboxResponse } from '@app-builder/models/analytics/case-status-by-inbox';
import { getCaseStatusByInboxFn } from '@app-builder/server-fns/analytics';
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

export const useCaseStatusByInbox = () => {
  const getCaseStatusByInbox = useServerFn(getCaseStatusByInboxFn);

  return useQuery({
    queryKey: ['case-status-by-inbox'],
    queryFn: async () => {
      const result = await getCaseStatusByInbox({ data: buildCaseStatusDateRange() });
      return result.caseStatusByInbox as CaseStatusByInboxResponse[];
    },
    placeholderData: keepPreviousData,
  });
};
