import { getRoute } from '@app-builder/utils/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serialize } from 'object-to-formdata';
import z from 'zod/v4';

export const addCommentPayloadSchema = z
  .object({
    caseId: z.uuid().nonempty(),
    comment: z.string(),
    files: z.array(z.instanceof(File)),
  })
  .refine((data) => data.comment.trim() !== '' || data.files.length > 0);

export type AddCommentPayload = z.infer<typeof addCommentPayloadSchema>;

const endpoint = getRoute('/ressources/cases/add-comment');

export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'add-comment'],
    mutationFn: async (payload: AddCommentPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: serialize(payload, { indices: true }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
