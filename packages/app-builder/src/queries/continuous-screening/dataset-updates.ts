import {
  type ContinuousScreeningDatasetUpdateSummary,
  type ListContinuousScreeningDatasetUpdatesParams,
} from '@app-builder/models/continuous-screening';
import { listContinuousScreeningDatasetUpdatesFn } from '@app-builder/server-fns/continuous-screening';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useContinuousScreeningDatasetUpdatesQuery = (
  params: ListContinuousScreeningDatasetUpdatesParams = {},
  options: { refetchInterval?: number; initialData?: ContinuousScreeningDatasetUpdateSummary[] } = {},
) => {
  const listDatasetUpdates = useServerFn(listContinuousScreeningDatasetUpdatesFn);

  return useQuery({
    queryKey: ['continuous-screening', 'dataset-updates', params],
    queryFn: async () => {
      const result = await listDatasetUpdates({ data: params });
      return result.items;
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

export const DATASET_UPDATES_PAGE_SIZE = 5;

export const useContinuousScreeningDatasetUpdatesInfiniteQuery = (limit = DATASET_UPDATES_PAGE_SIZE) => {
  const listDatasetUpdates = useServerFn(listContinuousScreeningDatasetUpdatesFn);

  return useInfiniteQuery({
    queryKey: ['continuous-screening', 'dataset-updates', 'infinite', limit],
    queryFn: async ({ pageParam }) =>
      listDatasetUpdates({ data: { limit, order: 'DESC', offsetId: pageParam ?? undefined } }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.items[lastPage.items.length - 1]?.id ?? null) : null,
    placeholderData: keepPreviousData,
  });
};
