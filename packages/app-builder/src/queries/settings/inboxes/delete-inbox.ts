import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteInboxPayloadSchema = z.object({
  inboxId: z.uuid(),
});

export type DeleteInboxPayload = z.infer<typeof deleteInboxPayloadSchema>;

const endpoint = getRoute('/ressources/settings/inboxes/delete');

export const useDeleteInboxMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'delete'],
    mutationFn: async (payload: DeleteInboxPayload) => {
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
