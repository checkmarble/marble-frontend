import { type DataModelTableOptions } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { Navigate } from '@remix-run/react';
import { useQuery } from '@tanstack/react-query';

const endpoint = (tableId: string) => getRoute('/ressources/data/:tableId/table-options', { tableId });

export function tableOptionsQueryOptions(tableId: string) {
  return {
    queryKey: ['data-model', 'table-options', tableId],
    queryFn: async () => {
      const res = await fetch(endpoint(tableId));

      const result = await res.json();

      if ('redirectTo' in result) {
        Navigate(result.redirectTo);
        return null;
      }

      return result as { tableOptions: DataModelTableOptions };
    },
  };
}

export function useTableOptionsQuery(tableId: string | undefined) {
  return useQuery({
    ...tableOptionsQueryOptions(tableId ?? ''),
    enabled: !!tableId,
  });
}
