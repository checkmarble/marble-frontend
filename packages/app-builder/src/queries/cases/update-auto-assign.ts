import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateAutoAssignPayloadSchema = z.object({
  inboxes: z.record(z.uuid(), z.boolean()),
  users: z.record(z.string(), z.boolean()),
});

export type UpdateAutoAssignPayload = z.infer<typeof updateAutoAssignPayloadSchema>;

const endpoint = getRoute('/ressources/cases/update-auto-assign');

export function useUpdateAutoAssignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'update-auto-assign'],
    mutationFn: async (payload: UpdateAutoAssignPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });
    },
  });
}
