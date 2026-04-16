import { deleteAnnotationFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDeleteAnnotationMutation = (annotationId: string) => {
  const deleteAnnotation = useServerFn(deleteAnnotationFn);

  return useMutation({
    mutationKey: ['annotations', 'delete-annotation', annotationId],
    mutationFn: async () => deleteAnnotation({ data: { annotationId } }),
  });
};
