import { type AddCommentPayload, addCommentPayloadSchema } from '@app-builder/schemas/cases';
import { addCommentFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { serialize } from 'object-to-formdata';

export { addCommentPayloadSchema, type AddCommentPayload };

export const useAddCommentMutation = () => {
  const addComment = useServerFn(addCommentFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'add-comment'],
    mutationFn: async (payload: AddCommentPayload) => addComment({ data: serialize(payload, { indices: true }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
