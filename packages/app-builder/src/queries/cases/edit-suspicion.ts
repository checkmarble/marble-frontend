import {
  type EditSuspicionPayload,
  type EditSuspicionResponse,
  editSuspicionPayloadSchema,
} from '@app-builder/schemas/cases';
import { editSuspicionFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { serialize } from 'object-to-formdata';

export { editSuspicionPayloadSchema, type EditSuspicionPayload, type EditSuspicionResponse };

export const useEditSuspicionMutation = () => {
  const editSuspicion = useServerFn(editSuspicionFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'edit-suspicion'],
    mutationFn: async (payload: EditSuspicionPayload) =>
      editSuspicion({ data: serialize(payload) }) as Promise<EditSuspicionResponse>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
