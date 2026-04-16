import { type CreateAnnotationPayload } from '@app-builder/schemas/annotations';
import { createAnnotationFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { serialize } from 'object-to-formdata';

export const useCreateAnnotationMutation = () => {
  const createAnnotation = useServerFn(createAnnotationFn);

  return useMutation({
    mutationKey: ['annotations', 'create'],
    mutationFn: async (payload: CreateAnnotationPayload) => {
      const formData = serialize(payload, { dotsForObjectNotation: true, indices: true });
      return createAnnotation({ data: formData });
    },
  });
};
