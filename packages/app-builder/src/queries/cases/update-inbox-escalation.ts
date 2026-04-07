import { type UpdateInboxEscalationPayload, updateInboxEscalationPayloadSchema } from '@app-builder/schemas/cases';
import { updateInboxEscalationFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateInboxEscalationPayloadSchema, type UpdateInboxEscalationPayload };

export const useUpdateInboxEscalationMutation = () => {
  const updateInboxEscalation = useServerFn(updateInboxEscalationFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'inboxes', 'update-escalation'],
    mutationFn: async (payload: UpdateInboxEscalationPayload) => updateInboxEscalation({ data: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });
    },
  });
};
