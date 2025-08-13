import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editFieldPayloadSchema = z.object({
  description: z.string(),
  fieldId: z.uuid(),
  isEnum: z.boolean(),
  isUnique: z.boolean(),
});

export type EditFieldPayload = z.infer<typeof editFieldPayloadSchema>;

const endpoint = getRoute('/ressources/data/editField');

export const useEditFieldMutation = () => {
  return useMutation({
    mutationKey: ['data', 'edit-field'],
    mutationFn: async (field: EditFieldPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(field),
      });

      return response.json();
    },
  });
};
