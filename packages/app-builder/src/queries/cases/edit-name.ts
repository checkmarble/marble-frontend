import { type EditNamePayload, editNamePayloadSchema } from '@app-builder/schemas/cases';
import { editNameFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { editNamePayloadSchema, type EditNamePayload };

export const useEditNameMutation = () => {
  const editName = useServerFn(editNameFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'edit-name'],
    mutationFn: async (payload: EditNamePayload) => editName({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
