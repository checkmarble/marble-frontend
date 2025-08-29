import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateInboxUserPayloadSchema = z.object({
  id: z.uuid(),
  inboxId: z.uuid(),
  role: z.enum(['admin', 'member']),
  autoAssignable: z.boolean(),
});

export type UpdateInboxUserPayload = z.infer<typeof updateInboxUserPayloadSchema>;

const endpoint = getRoute('/ressources/settings/inboxes/inbox-users/update');

export const useUpdateInboxUserMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'inbox-users', 'update'],
    mutationFn: async (payload: UpdateInboxUserPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
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
