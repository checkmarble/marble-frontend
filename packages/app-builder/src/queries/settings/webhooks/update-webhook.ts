import { type UpdateWebhookPayload, updateWebhookPayloadSchema } from '@app-builder/schemas/settings';
import { updateWebhookFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateWebhookPayloadSchema, type UpdateWebhookPayload };

export const useUpdateWebhookMutation = () => {
  const updateWebhook = useServerFn(updateWebhookFn);

  return useMutation({
    mutationFn: async (payload: UpdateWebhookPayload) => updateWebhook({ data: payload }),
  });
};
