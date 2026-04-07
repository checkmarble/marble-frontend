import { type DeleteInboxPayload, deleteInboxPayloadSchema } from '@app-builder/schemas/settings';
import { deleteInboxFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteInboxPayloadSchema, type DeleteInboxPayload };

export const useDeleteInboxMutation = () => {
  const deleteInbox = useServerFn(deleteInboxFn);

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'delete'],
    mutationFn: async (payload: DeleteInboxPayload) => deleteInbox({ data: payload }),
  });
};
