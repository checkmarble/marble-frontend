import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteTagPayloadSchema = z.object({
  tagId: z.uuid(),
});

export type DeleteTagPayload = z.infer<typeof deleteTagPayloadSchema>;

const endpoint = getRoute('/ressources/settings/tags/delete');

export const useDeleteTagMutation = () => {
  return useMutation({
    mutationFn: async (payload: DeleteTagPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
