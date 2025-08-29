import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateUserPayloadSchema = z.object({
  userId: z.uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email().min(5),
  role: z.enum(['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN']),
  organizationId: z.uuid(),
});

export type UpdateUserPayload = z.infer<typeof updateUserPayloadSchema>;

const endpoint = getRoute('/ressources/settings/users/update');

export const useUpdateUserMutation = () => {
  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
