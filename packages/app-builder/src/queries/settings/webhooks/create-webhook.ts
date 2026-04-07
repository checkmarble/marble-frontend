import { type CreateWebhookPayload, createWebhookPayloadSchema } from '@app-builder/schemas/settings';
import { createWebhookFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createWebhookPayloadSchema, type CreateWebhookPayload };

export const useCreateWebhookMutation = () => {
  const createWebhook = useServerFn(createWebhookFn);

  return useMutation({
    mutationFn: async (payload: CreateWebhookPayload) => createWebhook({ data: payload }),
  });
};
