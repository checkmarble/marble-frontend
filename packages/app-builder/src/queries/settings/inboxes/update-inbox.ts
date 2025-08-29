import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';
import { createInboxRedirectRouteOptions } from './create-inbox';

export const updateInboxPayloadSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  escalationInboxId: z.union([z.uuid(), z.null()]),
  autoAssignEnabled: z.boolean(),
  redirectRoute: z.enum(createInboxRedirectRouteOptions),
});

export type UpdateInboxPayload = z.infer<typeof updateInboxPayloadSchema>;

const endpoint = getRoute('/ressources/settings/inboxes/update');

export const useUpdateInboxMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'update'],
    mutationFn: async (payload: UpdateInboxPayload) => {
      const response = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
