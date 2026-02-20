import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const archiveScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
});

export type ArchiveScenarioPayload = z.infer<typeof archiveScenarioPayloadSchema>;

const endpoint = getRoute('/ressources/scenarios/archive');

export const useArchiveScenarioMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'archive'],
    mutationFn: async (data: ArchiveScenarioPayload) => {
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
