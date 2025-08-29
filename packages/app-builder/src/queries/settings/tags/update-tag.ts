import { tagColors } from '@app-builder/models/tags';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateTagPayloadSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  color: z.enum(tagColors),
});

export type UpdateTagPayload = z.infer<typeof updateTagPayloadSchema>;

const endpoint = getRoute('/ressources/settings/tags/update');

export const useUpdateTagMutation = () => {
  return useMutation({
    mutationFn: async (payload: UpdateTagPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
