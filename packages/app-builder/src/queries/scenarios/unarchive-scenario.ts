import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const unarchiveScenarioPayloadSchema = z.object({
  scenarioId: z.uuid(),
});

export type UnarchiveScenarioPayload = z.infer<typeof unarchiveScenarioPayloadSchema>;

const endpoint = getRoute('/ressources/scenarios/unarchive');

export const useUnarchiveScenarioMutation = () => {
  const revalidate = useLoaderRevalidator();

  return useMutation({
    mutationKey: ['scenarios', 'unarchive'],
    mutationFn: async (data: UnarchiveScenarioPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return response.json();
    },
    onSuccess: () => {
      revalidate();
    },
  });
};
