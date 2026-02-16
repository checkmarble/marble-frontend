import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const copyScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
  name: z.string().optional(),
});

export type CopyScenarioPayload = z.infer<typeof copyScenarioPayloadSchema>;

const endpoint = getRoute('/ressources/scenarios/copy');

export const useCopyScenarioMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'copy'],
    mutationFn: async (data: CopyScenarioPayload) => {
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
