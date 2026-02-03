import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { HierarchyTreeBase } from '@app-builder/routes/ressources+/data+/get-hierarchy.$objectType.$objectId';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (objectType: string, objectId: string) =>
  getRoute('/ressources/data/get-hierarchy/:objectType/:objectId', { objectType, objectId });

export const useHierarchyQuery = (objectType: string, objectId: string) => {
  const navigate = useAgnosticNavigation();
  return useQuery({
    queryKey: ['hierarchy', objectType, objectId],
    queryFn: async () => {
      const response = await fetch(endpoint(objectType, objectId));
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result as { hierarchy: HierarchyTreeBase };
    },
  });
};
