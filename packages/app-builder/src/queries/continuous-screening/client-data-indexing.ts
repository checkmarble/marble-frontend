import {
  type ContinuousScreeningClientDataIndexingResponse,
  type ListContinuousScreeningClientDataIndexingParams,
} from '@app-builder/models/continuous-screening';
import { listContinuousScreeningClientDataIndexingFn } from '@app-builder/server-fns/continuous-screening';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useContinuousScreeningClientDataIndexingQuery = (
  params: ListContinuousScreeningClientDataIndexingParams = {},
  options: { refetchInterval?: number; initialData?: ContinuousScreeningClientDataIndexingResponse } = {},
) => {
  const listClientDataIndexing = useServerFn(listContinuousScreeningClientDataIndexingFn);

  return useQuery({
    queryKey: ['continuous-screening', 'client-data-indexing', params],
    queryFn: async () => {
      const result = await listClientDataIndexing({ data: params });
      return result;
    },
    refetchInterval: options.refetchInterval,
    initialData: options.initialData,
    ...(options.initialData
      ? {
          staleTime: Number.POSITIVE_INFINITY,
          refetchOnMount: false,
        }
      : {}),
  });
};

export const CLIENT_DATA_INDEXING_PAGE_SIZE = 20;

const CLIENT_DATA_INDEXING_REFETCH_INTERVAL = 5000;

export const useContinuousScreeningClientDataIndexingInfiniteQuery = (limit = CLIENT_DATA_INDEXING_PAGE_SIZE) => {
  const listClientDataIndexing = useServerFn(listContinuousScreeningClientDataIndexingFn);

  return useInfiniteQuery({
    queryKey: ['continuous-screening', 'client-data-indexing', 'infinite', limit],
    queryFn: async ({ pageParam }) =>
      listClientDataIndexing({ data: { limit, order: 'DESC', offsetId: pageParam ?? undefined } }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.items[lastPage.items.length - 1]?.id ?? null) : null,
    placeholderData: keepPreviousData,
    // Poll only while a single page is loaded. An infinite query refetches every
    // loaded page on each tick, so once the user paginates we stop polling to avoid
    // refetching all pages every interval. (Polling also pauses when the tab is
    // unfocused and the query unmounts entirely when the panel is closed.)
    refetchInterval: (query) =>
      (query.state.data?.pages.length ?? 0) > 1 ? false : CLIENT_DATA_INDEXING_REFETCH_INTERVAL,
  });
};
