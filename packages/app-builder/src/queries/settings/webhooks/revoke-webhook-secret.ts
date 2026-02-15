import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const revokeWebhookSecretPayloadSchema = z.object({
  webhookId: z.string(),
  secretId: z.string(),
});

export type RevokeWebhookSecretPayload = z.infer<typeof revokeWebhookSecretPayloadSchema>;

const endpoint = getRoute('/ressources/settings/webhooks/revoke-secret');

export const useRevokeWebhookSecretMutation = () => {
  return useMutation({
    mutationFn: async (payload: RevokeWebhookSecretPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
