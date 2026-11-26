import { type DeleteWebhookPayload } from '@app-builder/schemas/settings';
import { deleteWebhookFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDeleteWebhookMutation = () => {
  const deleteWebhook = useServerFn(deleteWebhookFn);

  return useMutation({
    mutationFn: async (payload: DeleteWebhookPayload) => deleteWebhook({ data: payload }),
  });
};
