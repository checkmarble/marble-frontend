import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { GroupedAnnotations } from 'marble-api';
import QueryString from 'qs';

const endpoint = (objectType: string, objectId: string, qs: string) =>
  getRoute('/ressources/data/get-annotations/:objectType/:objectId', { objectType, objectId }) + '?' + qs;

const EMPTY_GROUPED_ANNOTATIONS: GroupedAnnotations = {
  comments: [],
  tags: [],
  files: [],
  risk_topics: [],
};

export const useGetAnnotationsQuery = (objectType: string, objectId: string, loadThumbnails: boolean = false) => {
  const navigate = useAgnosticNavigation();

  return useQuery({
    queryKey: ['annotations', objectType, objectId],
    queryFn: async () => {
      const qs = QueryString.stringify({ load_thumbnails: loadThumbnails });
      const response = await fetch(endpoint(objectType, objectId, qs));
      const result = await response.json();

      if ('redirectTo' in result) {
        navigate(result.redirectTo);
        return { annotations: EMPTY_GROUPED_ANNOTATIONS };
      }

      return result as { annotations: GroupedAnnotations };
    },
  });
};
