import { type CreateAnnotationPayload } from '@app-builder/schemas/annotations';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { serialize } from 'object-to-formdata';

const endpoint = getRoute('/ressources/data/create-annotation');

export const useCreateAnnotationMutation = () => {
  return useMutation({
    mutationKey: ['annotations', 'create'],
    mutationFn: async (payload: CreateAnnotationPayload) => {
      const formData = serialize(payload, { dotsForObjectNotation: true, indices: true });

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      return response.json();
    },
  });
};
