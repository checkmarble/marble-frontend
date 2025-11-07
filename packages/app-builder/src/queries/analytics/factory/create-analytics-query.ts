import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { type AnalyticsFiltersQuery } from '@app-builder/models/analytics';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function createAnalyticsQuery<TData>(queryName: string) {
  return ({ scenarioId, queryString }: { scenarioId: string; queryString: string }) => {
    const navigate = useAgnosticNavigation();
    const endpoint = getRoute('/ressources/analytics/:scenarioId/query/:queryName', {
      scenarioId,
      queryName,
    });
    console.log('endpoint', endpoint);
    const qs = queryString ? atob(queryString) : null;
    const parsed: AnalyticsFiltersQuery = JSON.parse(qs || '{}');

    const { range, compareRange, scenarioVersion, trigger } = parsed;

    return useQuery({
      queryKey: ['analytics', 'query', scenarioId, queryName, queryString],
      enabled: Boolean(qs && range),
      queryFn: async () => {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            scenarioVersion,
            range,
            compareRange,
            trigger,
          }),
        });

        const responseData = (await response.json()) as { redirectTo: string } | { data: TData };

        if ('redirectTo' in responseData) {
          navigate(responseData.redirectTo);
          return;
        }

        return responseData.data;
      },
      placeholderData: keepPreviousData,
    });
  };
}
