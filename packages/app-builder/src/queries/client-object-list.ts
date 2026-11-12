import { isRequestTimeoutError } from '@app-builder/models';
import { type ClientDataListResponse } from '@app-builder/models/data-model';
import { type ListObjectsInput } from '@app-builder/schemas/data';
import { listObjectsFn } from '@app-builder/server-fns/data';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export type DataTableObjectListResource = {
  clientDataListResponse: ClientDataListResponse;
};

type UseClientObjectListQueryParams = {
  tableName?: string;
  params: Omit<ListObjectsInput, 'tableName' | 'offsetId'>;
};

export function useClientObjectListQuery(params: UseClientObjectListQueryParams) {
  const listObjects = useServerFn(listObjectsFn);

  return useInfiniteQuery({
    queryKey: ['resources', 'data-list-object', params.tableName!, params.params] as const,
    queryFn: async ({ pageParam }) => {
      return listObjects({
        data: {
          tableName: params.tableName!,
          ...params.params,
          ...(pageParam !== null ? { offsetId: pageParam } : {}),
        },
      }) as Promise<DataTableObjectListResource>;
    },
    initialPageParam: null as string | number | null,
    getNextPageParam: (lastPage) => {
      return lastPage.clientDataListResponse.pagination.nextCursorId;
    },
    // Changing a filter keeps the current rows on screen until the new ones arrive.
    placeholderData: keepPreviousData,
    // A timed out query would time out again: let the user narrow the filters instead.
    retry: (failureCount, error) => !isRequestTimeoutError(error) && failureCount < 3,
    // Refetching reloads every loaded page, one request after the other.
    refetchOnWindowFocus: false,
    enabled: !!params.tableName,
  });
}
