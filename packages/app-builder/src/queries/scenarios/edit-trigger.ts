import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { astNodeSchema } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editTriggerPayloadSchema = z.object({
  astNode: astNodeSchema,
  schedule: z.string(),
});

export type EditTriggerPayload = z.infer<typeof editTriggerPayloadSchema>;

const endpoint = (iterationId: string) =>
  getRoute('/ressources/scenarios/iteration/:iterationId/edit-trigger', { iterationId });

export const useEditTriggerMutation = (iterationId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'edit-trigger'],
    mutationFn: async (data: EditTriggerPayload) => {
      const response = await fetch(endpoint(iterationId), {
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
