import type { DataTableObjectListResource } from '@app-builder/routes/ressources+/data+/$tableName.list-objects';
import { getRoute } from '@app-builder/utils/routes';
import { useInfiniteQuery } from '@tanstack/react-query';
import QueryString from 'qs';

const endpoint = (tableName: string, qs: string) =>
  getRoute('/ressources/data/:tableName/list-objects', {
    tableName,
  }) + qs;

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
  const strQs = QueryString.stringify(params.params, { skipNulls: true, addQueryPrefix: true });
  const queryKey = ['resources', 'data-list-object', params.tableName!, strQs] as const;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ queryKey: [_r, __, tableName, qs], pageParam }) => {
      const qsWithPageParam = pageParam ? `${qs}&offsetId=${pageParam}` : qs;
      const response = await fetch(endpoint(tableName, qsWithPageParam), {
        method: 'GET',
      });

      return response.json() as Promise<DataTableObjectListResource>;
    },
    initialPageParam: null as string | number | null,
    getNextPageParam: (lastPage, _pages) => {
      return lastPage.clientDataListResponse.pagination.nextCursorId;
    },
    enabled: !!params.tableName,
  });
}
