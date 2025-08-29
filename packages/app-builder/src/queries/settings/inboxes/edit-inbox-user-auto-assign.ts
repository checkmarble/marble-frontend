import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editInboxUserAutoAssignPayloadSchema = z.object({
  id: z.string(),
  autoAssignable: z.boolean(),
});

export type EditInboxUserAutoAssignPayload = z.infer<typeof editInboxUserAutoAssignPayloadSchema>;

const endpoint = getRoute('/ressources/settings/inboxes/inbox-users/edit-auto-assign');

export function useEditInboxUserAutoAssignMutation() {
  return useMutation({
    mutationFn: async (payload: EditInboxUserAutoAssignPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
}
