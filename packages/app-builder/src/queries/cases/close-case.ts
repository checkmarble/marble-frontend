import { finalOutcomes } from '@app-builder/models/cases';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const closeCasePayloadSchema = z.object({
  caseId: z.uuid(),
  outcome: z.enum(finalOutcomes).optional(),
  comment: z.string(),
});

export type CloseCasePayload = z.infer<typeof closeCasePayloadSchema>;

const endpoint = getRoute('/ressources/cases/close-case');

export const useCloseCaseMutation = () => {
  return useMutation({
    mutationKey: ['cases', 'close-case'],
    mutationFn: async (payload: CloseCasePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
