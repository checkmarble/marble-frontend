import { type CreateInboxUserPayload, createInboxUserPayloadSchema } from '@app-builder/schemas/settings';
import { createInboxUserFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createInboxUserPayloadSchema, type CreateInboxUserPayload };

export const useCreateInboxUserMutation = () => {
  const createInboxUser = useServerFn(createInboxUserFn);

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'inbox-users', 'create'],
    mutationFn: async (payload: CreateInboxUserPayload) => createInboxUser({ data: payload }),
  });
};
