import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { Case } from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = (objectType: string, objectId: string) =>
  getRoute('/ressources/cases/related/:objectType/:objectId', { objectType, objectId });

export const useRelatedCasesByObjectQuery = (objectType: string, objectId: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['cases', 'related', objectType, objectId],
    queryFn: async () => {
      const response = await fetch(endpoint(objectType, objectId));
      const result = (await response.json()) as { redirectTo: string } | { cases: Case[] };

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
