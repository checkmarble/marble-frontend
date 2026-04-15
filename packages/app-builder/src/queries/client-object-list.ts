import { type ClientDataListResponse } from '@app-builder/models/data-model';
import { listObjectsFn } from '@app-builder/server-fns/data';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export type DataTableObjectListResource = {
  clientDataListResponse: ClientDataListResponse;
};

type UseClientObjectListQueryParams = {
  tableName?: string;
  params: {
    sourceTableName: string;
    filterFieldName: string;
    filterFieldValue: string | number;
    orderingFieldName: string;
    limit?: number;
  };
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
    enabled: !!params.tableName,
  });
}
