import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const editAssigneePayloadSchema = z.object({
  assigneeId: z.string().nullable(),
  caseId: z.string(),
});

export type EditAssigneePayload = z.infer<typeof editAssigneePayloadSchema>;

const endpoint = getRoute('/ressources/cases/edit-assignee');

export const useEditAssigneeMutation = () => {
  return useMutation({
    mutationKey: ['case', 'edit-assignee'],
    mutationFn: async (payload: EditAssigneePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
