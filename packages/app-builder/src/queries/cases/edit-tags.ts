import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editTagsPayloadSchema = z.object({
  caseId: z.string(),
  tagIds: z.array(z.string()),
});

export type EditTagsPayload = z.infer<typeof editTagsPayloadSchema>;

const endpoint = getRoute('/ressources/cases/edit-tags');

export const useEditTagsMutation = () => {
  return useMutation({
    mutationKey: ['case', 'edit-tags'],
    mutationFn: async (payload: EditTagsPayload) => {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
