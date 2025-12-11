import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { DataModelObject } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (tableName: string, objectId: string) =>
  getRoute('/ressources/data/:tableName/:objectId/get', { tableName, objectId });

export const useObjectDetails = (tableName: string, objectId: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['data', 'object-details', tableName, objectId],
    queryFn: async () => {
      const response = await fetch(endpoint(tableName, objectId));
      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result as {
        tableName: string;
        objectId: string;
        object: DataModelObject | null;
      };
    },
  });
};
