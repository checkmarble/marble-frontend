import type { CaseAnalyticsFilters } from '@app-builder/models/analytics/case-analytics';
import { getCaseAnalyticsFn } from '@app-builder/server-fns/analytics';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const caseAnalyticsQueryKey = (filters: CaseAnalyticsFilters) => ['case-analytics', filters];

export const useCaseAnalytics = (filters: CaseAnalyticsFilters) => {
  const getCaseAnalytics = useServerFn(getCaseAnalyticsFn);

  return useQuery({
    queryKey: caseAnalyticsQueryKey(filters),
    queryFn: async () => {
      const result = await getCaseAnalytics({
        data: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          inboxId: filters.inboxId,
          userId: filters.userId,
        },
      });
      return result.caseAnalytics;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes — avoid refetching on tab switches
    refetchOnWindowFocus: false,
  });
};
