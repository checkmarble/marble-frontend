import { type UpdateInboxWorkflowPayload, updateInboxWorkflowPayloadSchema } from '@app-builder/schemas/cases';
import { updateInboxWorkflowFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateInboxWorkflowPayloadSchema, type UpdateInboxWorkflowPayload };

export const useUpdateInboxWorkflowMutation = () => {
  const updateInboxWorkflow = useServerFn(updateInboxWorkflowFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'inboxes', 'update-workflow'],
    mutationFn: async (payload: UpdateInboxWorkflowPayload) => updateInboxWorkflow({ data: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });
    },
  });
};
