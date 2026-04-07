import { DateRangeFilter } from '@app-builder/models/analytics';
import { AvailableFiltersResponse } from '@app-builder/models/analytics/available-filters';
import { getAvailableFiltersFn } from '@app-builder/server-fns/analytics';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetAvailableFilters = ({ scenarioId, ranges }: { scenarioId: string; ranges: DateRangeFilter[] }) => {
  const getAvailableFilters = useServerFn(getAvailableFiltersFn);

  return useQuery({
    queryKey: ['analytics', 'available-filters', scenarioId, ranges],
    enabled: Array.isArray(ranges) && ranges.length > 0,
    placeholderData: keepPreviousData,
    queryFn: async () => getAvailableFilters({ data: { scenarioId, ranges } }) as Promise<AvailableFiltersResponse>,
  });
};
