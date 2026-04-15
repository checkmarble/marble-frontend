import {
  type CreateInboxPayload,
  createInboxPayloadSchema,
  createInboxRedirectRouteOptions,
} from '@app-builder/schemas/settings';
import { createInboxFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createInboxPayloadSchema, createInboxRedirectRouteOptions, type CreateInboxPayload };

export const useCreateInboxMutation = () => {
  const createInbox = useServerFn(createInboxFn);

  return useMutation({
    mutationKey: ['settings', 'inboxes', 'create'],
    mutationFn: async (payload: CreateInboxPayload) => createInbox({ data: payload }),
  });
};
