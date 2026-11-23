import { isRequestTimeoutError } from '@app-builder/models';
import { type ClientDataListResponse } from '@app-builder/models/data-model';
import { type ListObjectsInput } from '@app-builder/schemas/data';
import { listObjectsFn } from '@app-builder/server-fns/data';
import { type InfiniteData, keepPreviousData, type QueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { type GroupedAnnotations } from 'marble-api';

type DataTableObjectListResource = {
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

/**
 * Writes the fresh annotations of one object into its rows in every cached list of its table.
 * Refetching the list instead would reload every loaded page, one after the other, before the change shows.
 */
export async function setClientObjectListAnnotations(
  queryClient: QueryClient,
  tableName: string,
  objectId: string,
  annotations: GroupedAnnotations,
) {
  const lists = { queryKey: ['resources', 'data-list-object', tableName] };
  const write = () =>
    queryClient.setQueriesData<InfiniteData<DataTableObjectListResource, string | number | null>>(
      lists,
      (list) =>
        list && {
          ...list,
          pages: list.pages.map(({ clientDataListResponse }) => ({
            clientDataListResponse: {
              ...clientDataListResponse,
              data: clientDataListResponse.data.map((row) =>
                row.data.object_id === objectId ? { ...row, annotations } : row,
              ),
            },
          })),
        },
    );

  write();
  // A list fetch already in flight (Load more, new filters) stores the pages it read before this write: write again
  // once the fetches are over.
  if (queryClient.isFetching(lists) === 0) return;
  await new Promise<void>((resolve) => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      if (queryClient.isFetching(lists) > 0) return;
      unsubscribe();
      resolve();
    });
  });
  write();
}
