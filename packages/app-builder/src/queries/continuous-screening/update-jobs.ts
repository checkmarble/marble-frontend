import {
  type ContinuousScreeningUpdateJobSummary,
  type ListContinuousScreeningUpdateJobsParams,
} from '@app-builder/models/continuous-screening';
import { listContinuousScreeningUpdateJobsFn } from '@app-builder/server-fns/continuous-screening';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useContinuousScreeningUpdateJobsQuery = (
  params: ListContinuousScreeningUpdateJobsParams = {},
  options: { refetchInterval?: number; initialData?: ContinuousScreeningUpdateJobSummary[] } = {},
) => {
  const listUpdateJobs = useServerFn(listContinuousScreeningUpdateJobsFn);

  return useQuery({
    queryKey: ['continuous-screening', 'update-jobs', params],
    queryFn: async () => {
      const result = await listUpdateJobs({ data: params });
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

export const UPDATE_JOBS_PAGE_SIZE = 10;

export const useContinuousScreeningUpdateJobsInfiniteQuery = (limit = UPDATE_JOBS_PAGE_SIZE) => {
  const listUpdateJobs = useServerFn(listContinuousScreeningUpdateJobsFn);

  return useInfiniteQuery({
    queryKey: ['continuous-screening', 'update-jobs', 'infinite', limit],
    queryFn: async ({ pageParam }) =>
      listUpdateJobs({ data: { limit, order: 'DESC', offsetId: pageParam ?? undefined } }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? (lastPage.items[lastPage.items.length - 1]?.id ?? null) : null,
    placeholderData: keepPreviousData,
  });
};
