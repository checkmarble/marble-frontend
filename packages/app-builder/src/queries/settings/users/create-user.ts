import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const createUserPayloadSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.email().nonempty(),
  role: z.enum(['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN']),
  organizationId: z.uuid().nonempty(),
});

export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;

const endpoint = getRoute('/ressources/settings/users/create');

export const useCreateUserMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
