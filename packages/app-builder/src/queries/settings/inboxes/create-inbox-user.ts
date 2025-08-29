import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const createInboxUserPayloadSchema = z.object({
  userId: z.uuid().nonempty(),
  inboxId: z.uuid().nonempty(),
  role: z.enum(['admin', 'member']),
  autoAssignable: z.boolean(),
});

export type CreateInboxUserPayload = z.infer<typeof createInboxUserPayloadSchema>;

const endpoint = getRoute('/ressources/settings/inboxes/inbox-users/create');

export const useCreateInboxUserMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'inbox-users', 'create'],
    mutationFn: async (payload: CreateInboxUserPayload) => {
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
