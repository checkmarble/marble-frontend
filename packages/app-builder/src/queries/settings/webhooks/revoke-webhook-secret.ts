import { type RevokeWebhookSecretPayload, revokeWebhookSecretPayloadSchema } from '@app-builder/schemas/settings';
import { revokeWebhookSecretFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { revokeWebhookSecretPayloadSchema, type RevokeWebhookSecretPayload };

export const useRevokeWebhookSecretMutation = () => {
  const revokeWebhookSecret = useServerFn(revokeWebhookSecretFn);

  return useMutation({
    mutationFn: async (payload: RevokeWebhookSecretPayload) => revokeWebhookSecret({ data: payload }),
  });
};
