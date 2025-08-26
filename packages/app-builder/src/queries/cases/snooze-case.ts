import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const snoozeCasePayloadSchema = z.object({
  caseId: z.string(),
  snoozeUntil: z.string().nullable(),
});

export type SnoozeCasePayload = z.infer<typeof snoozeCasePayloadSchema>;

const endpoint = getRoute('/ressources/cases/snooze-case');

export const useSnoozeCaseMutation = () => {
  return useMutation({
    mutationFn: async (payload: SnoozeCasePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
