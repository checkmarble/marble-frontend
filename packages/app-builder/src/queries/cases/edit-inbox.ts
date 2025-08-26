import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editInboxPayloadSchema = z.object({ inboxId: z.string(), caseId: z.string() });

export type EditInboxPayload = z.infer<typeof editInboxPayloadSchema>;

const endpoint = getRoute('/ressources/cases/edit-inbox');

export const useEditInboxMutation = () => {
  return useMutation({
    mutationKey: ['case', 'edit-inbox'],
    mutationFn: async (payload: EditInboxPayload) => {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
