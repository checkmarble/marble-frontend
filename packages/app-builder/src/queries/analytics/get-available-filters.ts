import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { AvailableFiltersResponse } from '@app-builder/models/analytics/available-filters';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

export const useGetAvailableFilters = ({
  scenarioId,
  dateRange,
}: {
  scenarioId: string;
  dateRange: { start: string; end: string };
}) => {
  const navigate = useAgnosticNavigation();

  const endpoint = getRoute('/ressources/analytics/available_filters/:scenarioId', {
    scenarioId,
  });
  return useQuery({
    queryKey: ['analytics', 'available-filters', scenarioId, dateRange],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenarioId, start: dateRange.start, end: dateRange.end }),
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
