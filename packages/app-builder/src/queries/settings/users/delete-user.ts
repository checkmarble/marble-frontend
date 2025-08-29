import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteUserPayloadSchema = z.object({
  userId: z.uuid(),
});

export type DeleteUserPayload = z.infer<typeof deleteUserPayloadSchema>;

const endpoint = getRoute('/ressources/settings/users/delete');

export const useDeleteUserMutation = () => {
  return useMutation({
    mutationFn: async (payload: DeleteUserPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
