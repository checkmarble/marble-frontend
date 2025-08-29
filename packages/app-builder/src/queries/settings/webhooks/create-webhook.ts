import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { eventTypes } from '@app-builder/models/webhook';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createWebhookPayloadSchema = z.object({
  url: z.url(),
  eventTypes: z.array(z.enum(eventTypes)),
  httpTimeout: z.int().positive().optional(),
});

export type CreateWebhookPayload = z.infer<typeof createWebhookPayloadSchema>;

const endpoint = getRoute('/ressources/settings/webhooks/create');

export const useCreateWebhookMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationFn: async (payload: CreateWebhookPayload) => {
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
