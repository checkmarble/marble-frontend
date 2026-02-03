import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { GroupedAnnotations } from 'marble-api';

const endpoint = (objectType: string, objectId: string) =>
  getRoute('/ressources/data/get-annotations/:objectType/:objectId', { objectType, objectId });

const EMPTY_GROUPED_ANNOTATIONS: GroupedAnnotations = {
  comments: [],
  tags: [],
  files: [],
};

export const useGetAnnotationsQuery = (objectType: string, objectId: string) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['annotations', objectType, objectId],
    queryFn: async () => {
      const response = await fetch(endpoint(objectType, objectId));
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return { annotations: EMPTY_GROUPED_ANNOTATIONS };
      }

      return result as { annotations: GroupedAnnotations };
    },
  });
};
