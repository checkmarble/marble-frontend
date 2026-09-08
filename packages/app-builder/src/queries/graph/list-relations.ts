import { listGraphRelationsFn } from '@app-builder/server-fns/graph';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const graphRelationsQueryKey = ['graph', 'relations'] as const;

export function useListGraphRelationsQuery() {
  const listGraphRelations = useServerFn(listGraphRelationsFn);

  return useQuery({
    queryKey: graphRelationsQueryKey,
    queryFn: async () => listGraphRelations(),
  });
}
