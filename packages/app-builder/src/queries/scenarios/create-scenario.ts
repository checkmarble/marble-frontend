import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createScenarioPayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  triggerObjectType: z.string().min(1),
});

export type CreateScenarioPayload = z.infer<typeof createScenarioPayloadSchema>;

const endpoint = getRoute('/ressources/scenarios/create');

export const useCreateScenarioMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'create'],
    mutationFn: async (data: CreateScenarioPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
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
