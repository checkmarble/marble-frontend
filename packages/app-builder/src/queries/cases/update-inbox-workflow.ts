import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const updateInboxWorkflowPayloadSchema = z.object({
  updates: z.array(
    z.object({
      inboxId: z.uuid(),
      caseReviewManual: z.boolean(),
      caseReviewOnCaseCreated: z.boolean(),
      caseReviewOnEscalate: z.boolean(),
    }),
  ),
});

export type UpdateInboxWorkflowPayload = z.infer<typeof updateInboxWorkflowPayloadSchema>;

const endpoint = getRoute('/ressources/cases/update-inbox-workflow');

export const useUpdateInboxWorkflowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'inboxes', 'update-workflow'],
    mutationFn: async (payload: UpdateInboxWorkflowPayload) => {
      const response = await fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });
    },
  });
};
