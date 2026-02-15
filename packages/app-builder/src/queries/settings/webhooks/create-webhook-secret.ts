import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createWebhookSecretPayloadSchema = z.object({
  webhookId: z.string(),
  expireExistingInDays: z.int().positive().optional(),
});

export type CreateWebhookSecretPayload = z.infer<typeof createWebhookSecretPayloadSchema>;

const endpoint = getRoute('/ressources/settings/webhooks/create-secret');

export const useCreateWebhookSecretMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreateWebhookSecretPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
