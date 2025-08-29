import { tagColors } from '@app-builder/models/tags';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createTagPayloadSchema = z.object({
  name: z.string().min(1),
  color: z.enum(tagColors),
  target: z.enum(['case', 'object']),
});

export type CreateTagPayload = z.infer<typeof createTagPayloadSchema>;

const endpoint = getRoute('/ressources/settings/tags/create');

export const useCreateTagMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreateTagPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
