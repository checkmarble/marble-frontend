import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = (annotationId: string) =>
  getRoute('/ressources/data/delete-annotation/:annotationId', { annotationId });

export const useDeleteAnnotationMutation = (annotationId: string) => {
  return useMutation({
    mutationKey: ['annotations', 'delete-annotation', annotationId],
    mutationFn: async () => {
      const response = await fetch(endpoint(annotationId), {
        method: 'POST',
      });

      return response.json();
    },
  });
};
