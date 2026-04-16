import { getHierarchyFn, type HierarchyTreeBase } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export type { HierarchyTreeBase };

export const useHierarchyQuery = (objectType: string, objectId: string, showAll: boolean) => {
  const getHierarchy = useServerFn(getHierarchyFn);

  return useQuery({
    queryKey: ['hierarchy', objectType, objectId, showAll],
    queryFn: async () => {
      return getHierarchy({ data: { objectType, objectId, showAll } }) as Promise<{ hierarchy: HierarchyTreeBase }>;
    },
  });
};
