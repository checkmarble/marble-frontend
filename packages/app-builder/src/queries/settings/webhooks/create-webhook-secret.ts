import { type CreateWebhookSecretPayload, createWebhookSecretPayloadSchema } from '@app-builder/schemas/settings';
import { createWebhookSecretFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createWebhookSecretPayloadSchema, type CreateWebhookSecretPayload };

export const useCreateWebhookSecretMutation = () => {
  const createWebhookSecret = useServerFn(createWebhookSecretFn);

  return useMutation({
    mutationFn: async (payload: CreateWebhookSecretPayload) => createWebhookSecret({ data: payload }),
  });
};
