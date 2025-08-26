import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editNamePayloadSchema = z.object({ name: z.string(), caseId: z.string() });

export type EditNamePayload = z.infer<typeof editNamePayloadSchema>;

const endpoint = getRoute('/ressources/cases/edit-name');

export const useEditNameMutation = () => {
  return useMutation({
    mutationKey: ['case', 'edit-name'],
    mutationFn: async (payload: EditNamePayload) => {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
