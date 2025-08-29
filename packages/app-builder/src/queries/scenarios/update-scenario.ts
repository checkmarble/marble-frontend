import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
  name: z.string().min(1),
  description: z.string(),
});

export type UpdateScenarioPayload = z.infer<typeof updateScenarioPayloadSchema>;

const endpoint = getRoute('/ressources/scenarios/update');

export const useUpdateScenarioMutation = () => {
  return useMutation({
    mutationKey: ['scenarios', 'update'],
    mutationFn: async (data: UpdateScenarioPayload) => {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      return response.json();
    },
  });
};
