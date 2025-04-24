import { type DataTableObjectListResource } from '@app-builder/routes/ressources+/data+/$tableName.list-objects';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';
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
    offsetId: string | number | null;
  };
};
export function useClientObjectListQuery(params: UseClientObjectListQueryParams) {
  const strQs = QueryString.stringify(
    { ...params.params },
    { skipNulls: true, addQueryPrefix: true },
  );
  const queryKey = ['resources', 'data-list-object', params.tableName!, strQs] as const;

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [_r, __, tableName, qs] }) => {
      const response = await fetch(endpoint(tableName, qs), {
        method: 'GET',
      });
      return response.json() as Promise<DataTableObjectListResource>;
    },
    enabled: !!params.tableName,
  });
}
