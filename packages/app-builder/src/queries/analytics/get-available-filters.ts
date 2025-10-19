import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { DateRangeFilter } from '@app-builder/models/analytics';
import { AvailableFiltersResponse } from '@app-builder/models/analytics/available-filters';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

export const useGetAvailableFilters = ({
  scenarioId,
  ranges,
}: {
  scenarioId: string;
  ranges: DateRangeFilter[];
}) => {
  const navigate = useAgnosticNavigation();

  const endpoint = getRoute('/ressources/analytics/:scenarioId/available_filters', {
    scenarioId,
  });
  return useQuery({
    queryKey: ['analytics', 'available-filters', scenarioId, ranges],
    enabled: Array.isArray(ranges) && ranges.length > 0,
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenarioId, ranges }),
      });
      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result as Promise<AvailableFiltersResponse>;
    },
  });
};
