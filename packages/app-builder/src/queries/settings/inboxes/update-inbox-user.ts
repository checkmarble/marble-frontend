import { type UpdateInboxUserPayload } from '@app-builder/schemas/settings';
import { updateInboxUserFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUpdateInboxUserMutation = () => {
  const updateInboxUser = useServerFn(updateInboxUserFn);

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'inbox-users', 'update'],
    mutationFn: async (payload: UpdateInboxUserPayload) => updateInboxUser({ data: payload }),
  });
};
