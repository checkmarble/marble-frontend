import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateInboxEscalationPayloadSchema = z.object({
  inboxId: z.uuid(),
  escalationInboxId: z.union([z.uuid(), z.null()]),
});

export type UpdateInboxEscalationPayload = z.infer<typeof updateInboxEscalationPayloadSchema>;

const endpoint = getRoute('/ressources/cases/update-inbox-escalation');

export const useUpdateInboxEscalationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'inboxes', 'update-escalation'],
    mutationFn: async (payload: UpdateInboxEscalationPayload) => {
      const response = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });
    },
  });
};
