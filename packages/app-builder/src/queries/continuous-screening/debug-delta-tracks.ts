import { type DebugDeltaTrack } from '@app-builder/models/continuous-screening-debug';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import QueryString from 'qs';

type DebugDeltaTracksResponse = {
  hasNextPage: boolean;
  items: DebugDeltaTrack[];
};

const endpoint = getRoute('/ressources/settings/cs-debug-delta-tracks');

export const useGetDebugDeltaTracksQuery = (limit: number) => {
  return useInfiniteQuery({
    queryKey: ['continuous-screening', 'debug-delta-tracks', limit],
    queryFn: async ({ pageParam }) => {
      const qs = QueryString.stringify(
        { limit, offset_id: pageParam, sorting: 'created_at', order: 'DESC' },
        { skipNulls: true, addQueryPrefix: true },
      );
      const response = await fetch(endpoint + qs, {
        method: 'GET',
      });
      const responseData = (await response.json()) as { data: DebugDeltaTracksResponse };

      return responseData.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (page) => {
      return page?.hasNextPage ? page.items[page.items.length - 1]?.id : null;
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
};
