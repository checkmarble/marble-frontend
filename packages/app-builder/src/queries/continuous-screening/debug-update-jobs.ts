import { type DebugUpdateJob } from '@app-builder/models/continuous-screening-debug';
import { getRoute } from '@app-builder/utils/routes';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import QueryString from 'qs';

type DebugUpdateJobsResponse = {
  hasNextPage: boolean;
  items: DebugUpdateJob[];
};

const endpoint = getRoute('/ressources/settings/cs-debug-update-jobs');

export const useGetDebugUpdateJobsQuery = (limit: number) => {
  return useInfiniteQuery({
    queryKey: ['continuous-screening', 'debug-update-jobs', limit],
    queryFn: async ({ pageParam }) => {
      const qs = QueryString.stringify(
        { limit, offset_id: pageParam, sorting: 'created_at', order: 'DESC' },
        { skipNulls: true, addQueryPrefix: true },
      );
      const response = await fetch(endpoint + qs, {
        method: 'GET',
      });
      const responseData = (await response.json()) as { data: DebugUpdateJobsResponse };

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
