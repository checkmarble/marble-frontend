import { type DataModelTableOptions } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

export function tableOptionsQueryOptions(tableId: string) {
  return {
    queryKey: ['data-model', 'table-options', tableId],
    queryFn: async () => {
      const response = await fetch(getRoute('/ressources/data/:tableId/table-options', { tableId }));
      return response.json() as Promise<{ tableOptions: DataModelTableOptions }>;
    },
  };
}

export function useTableOptionsQuery(tableId: string | undefined) {
  return useQuery({
    ...tableOptionsQueryOptions(tableId ?? ''),
    enabled: !!tableId,
  });
}
