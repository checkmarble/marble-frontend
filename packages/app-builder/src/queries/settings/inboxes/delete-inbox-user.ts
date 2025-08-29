import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteInboxUserPayloadSchema = z.object({
  inboxId: z.uuid(),
  inboxUserId: z.uuid(),
});

export type DeleteInboxUserPayload = z.infer<typeof deleteInboxUserPayloadSchema>;

const endpoint = getRoute('/ressources/settings/inboxes/inbox-users/delete');

export const useDeleteInboxUserMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'inbox-users', 'delete'],
    mutationFn: async (payload: DeleteInboxUserPayload) => {
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
