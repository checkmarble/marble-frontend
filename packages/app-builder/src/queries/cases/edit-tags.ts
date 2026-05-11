import { type EditTagsPayload, editTagsPayloadSchema } from '@app-builder/schemas/cases';
import { editTagsFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type EditTagsPayload, editTagsPayloadSchema };

export const useEditTagsMutation = () => {
  const editTags = useServerFn(editTagsFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'edit-tags'],
    mutationFn: async (payload: EditTagsPayload) => editTags({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
