import { type DataModelTableOptions } from '@app-builder/models/data-model';
import { getTableOptionsFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export function useTableOptionsQuery(tableId: string | undefined) {
  const getTableOptions = useServerFn(getTableOptionsFn);

  return useQuery({
    queryKey: ['data-model', 'table-options', tableId],
    queryFn: async () => {
      return getTableOptions({ data: { tableId: tableId! } }) as Promise<{ tableOptions: DataModelTableOptions }>;
    },
    enabled: !!tableId,
  });
}
