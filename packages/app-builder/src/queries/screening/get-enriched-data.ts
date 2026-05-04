import { GetEnrichedDataInput, getEnrichedDataFn } from '@app-builder/server-fns/screenings';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetEnrichedDataQuery = (input: GetEnrichedDataInput, enabled: boolean) => {
  const getEnrichedData = useServerFn(getEnrichedDataFn);

  return useQuery({
    queryKey: ['screening', 'get-enriched-data', input.entityId],
    queryFn: async () => {
      return getEnrichedData({ data: input });
    },
    enabled,
  });
};
