import { eventTypes } from '@app-builder/models/webhook';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const updateWebhookPayloadSchema = z.object({
  id: z.string().nonempty(),
  eventTypes: z.array(z.enum(eventTypes)),
  httpTimeout: z.int().positive().optional(),
});

export type UpdateWebhookPayload = z.infer<typeof updateWebhookPayloadSchema>;

const endpoint = getRoute('/ressources/settings/webhooks/update');

export const useUpdateWebhookMutation = () => {
  return useMutation({
    mutationFn: async (payload: UpdateWebhookPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
