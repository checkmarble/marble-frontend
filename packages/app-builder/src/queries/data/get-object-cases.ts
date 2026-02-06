import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { Case } from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (objectType: string, objectId: string) =>
  getRoute('/ressources/data/cases/:objectType/:objectId', { objectType, objectId });

export const useGetObjectCasesQuery = (objectType: string, objectId: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['data', objectType, objectId, 'cases'],
    queryFn: async () => {
      const response = await fetch(endpoint(objectType, objectId));
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return { cases: [] };
      }

      return result as { cases: Case[] };
    },
  });
};
