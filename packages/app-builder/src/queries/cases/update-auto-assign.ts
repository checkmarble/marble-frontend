import { type UpdateAutoAssignPayload, updateAutoAssignPayloadSchema } from '@app-builder/schemas/cases';
import { updateAutoAssignFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { updateAutoAssignPayloadSchema, type UpdateAutoAssignPayload };

export function useUpdateAutoAssignMutation() {
  const updateAutoAssign = useServerFn(updateAutoAssignFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'update-auto-assign'],
    mutationFn: async (payload: UpdateAutoAssignPayload) => updateAutoAssign({ data: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });
    },
  });
}
