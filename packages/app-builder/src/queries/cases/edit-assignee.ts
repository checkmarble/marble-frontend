import { type EditAssigneePayload, editAssigneePayloadSchema } from '@app-builder/schemas/cases';
import { editAssigneeFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { editAssigneePayloadSchema, type EditAssigneePayload };

export const useEditAssigneeMutation = () => {
  const editAssignee = useServerFn(editAssigneeFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'edit-assignee'],
    mutationFn: async (payload: EditAssigneePayload) => editAssignee({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
