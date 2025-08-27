import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createTestRunPayloadSchema = z.object({
  refIterationId: z.string(),
  testIterationId: z.string(),
  endDate: z.string(),
});

export type CreateTestRunPayload = z.infer<typeof createTestRunPayloadSchema>;

const endpoint = (scenarioId: string) =>
  getRoute('/ressources/scenarios/:scenarioId/testrun/create', {
    scenarioId: fromUUIDtoSUUID(scenarioId),
  });

export const useCreateTestRunMutation = (scenarioId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'testrun', 'create', scenarioId],
    mutationFn: async (payload: CreateTestRunPayload) => {
      const response = await fetch(endpoint(scenarioId), {
        method: 'POST',
        body: JSON.stringify(payload),
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
