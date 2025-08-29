import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const updateOrganizationPayloadSchema = z.object({
  organizationId: z.string().min(1),
  autoAssignQueueLimit: z.coerce.number().min(0).optional(),
});

export type UpdateOrganizationPayload = z.infer<typeof updateOrganizationPayloadSchema>;

const endpoint = getRoute('/ressources/settings/organization/update');

export const useUpdateOrganizationMutation = () => {
  return useMutation({
    mutationFn: async (payload: UpdateOrganizationPayload) => {
      const response = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
