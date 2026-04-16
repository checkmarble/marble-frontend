import { type UpdateInboxPayload, updateInboxPayloadSchema } from '@app-builder/schemas/settings';
import { updateInboxFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateInboxPayloadSchema, type UpdateInboxPayload };

export const useUpdateInboxMutation = () => {
  const updateInbox = useServerFn(updateInboxFn);

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'update'],
    mutationFn: async (payload: UpdateInboxPayload) => updateInbox({ data: payload }),
  });
};
