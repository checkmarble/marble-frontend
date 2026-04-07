import { type DeleteInboxUserPayload, deleteInboxUserPayloadSchema } from '@app-builder/schemas/settings';
import { deleteInboxUserFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteInboxUserPayloadSchema, type DeleteInboxUserPayload };

export const useDeleteInboxUserMutation = () => {
  const deleteInboxUser = useServerFn(deleteInboxUserFn);

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'inbox-users', 'delete'],
    mutationFn: async (payload: DeleteInboxUserPayload) => deleteInboxUser({ data: payload }),
  });
};
