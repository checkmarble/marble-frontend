import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const applyArchetypePayloadSchema = z.object({
  name: z.string().min(1),
});

export type ApplyArchetypePayload = z.infer<typeof applyArchetypePayloadSchema>;

const endpoint = getRoute('/ressources/data/apply-archetype');

export const useApplyArchetypeMutation = () => {
  return useMutation({
    mutationKey: ['data', 'apply-archetype'],
    mutationFn: async (payload: ApplyArchetypePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
