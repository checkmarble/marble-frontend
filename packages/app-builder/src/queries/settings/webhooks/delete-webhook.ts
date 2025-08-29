import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteWebhookPayloadSchema = z.object({
  webhookId: z.string(),
});

export type DeleteWebhookPayload = z.infer<typeof deleteWebhookPayloadSchema>;

const endpoint = getRoute('/ressources/settings/webhooks/delete');

export const useDeleteWebhookMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: async (payload: DeleteWebhookPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
