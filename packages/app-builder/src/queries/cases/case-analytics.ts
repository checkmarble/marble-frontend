import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import type { CaseAnalyticsFilters, CaseAnalyticsResponse } from '@app-builder/models/analytics/case-analytics';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const caseAnalyticsQueryKey = (filters: CaseAnalyticsFilters) => ['case-analytics', filters];

export const useCaseAnalytics = (filters: CaseAnalyticsFilters) => {
  const navigate = useAgnosticNavigation();

  const endpoint = getRoute('/ressources/analytics/case-analytics');
  const params = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  if (filters.inboxId) {
    params.set('inboxId', filters.inboxId);
  }
  if (filters.userId) {
    params.set('userId', filters.userId);
  }

  return useQuery({
    queryKey: caseAnalyticsQueryKey(filters),
    queryFn: async () => {
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET',
      });
      const result = (await response.json()) as { redirectTo: string } | { caseAnalytics: CaseAnalyticsResponse };

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result.caseAnalytics;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes — avoid refetching on tab switches
    refetchOnWindowFocus: false,
  });
};
