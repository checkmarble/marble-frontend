import { getAnnotationsFn } from '@app-builder/server-fns/data';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { type GroupedAnnotations } from 'marble-api';

const EMPTY_GROUPED_ANNOTATIONS: GroupedAnnotations = {
  comments: [],
  tags: [],
  files: [],
  risk_tags: [],
};

export const useGetAnnotationsQuery = (objectType: string, objectId: string, loadThumbnails: boolean = false) => {
  const getAnnotations = useServerFn(getAnnotationsFn);

  return useQuery({
    queryKey: ['annotations', objectType, objectId, loadThumbnails],
    queryFn: async () => {
      const result = await (getAnnotations({ data: { objectType, objectId, loadThumbnails } }) as Promise<{
        annotations: GroupedAnnotations;
      }>);
      return result ?? { annotations: EMPTY_GROUPED_ANNOTATIONS };
    },
  });
};
