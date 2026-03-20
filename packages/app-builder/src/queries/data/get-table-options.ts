import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { type DataModelTableOptions } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (tableId: string) => getRoute('/ressources/data/:tableId/table-options', { tableId });

export function tableOptionsQueryOptions(tableId: string) {
  return {
    queryKey: ['data-model', 'table-options', tableId],
  };
}

export function useTableOptionsQuery(tableId: string | undefined) {
  const navigate = useAgnosticNavigation();
  if (!tableId) return null;
  return useQuery({
    ...tableOptionsQueryOptions(tableId),
    queryFn: async () => {
      const res = await fetch(endpoint(tableId));
      const result = await res.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return null;
      }

      return result as { tableOptions: DataModelTableOptions };
    },
    enabled: !!tableId,
  });
}
