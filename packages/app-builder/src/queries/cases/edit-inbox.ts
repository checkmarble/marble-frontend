import { type EditInboxPayload, editInboxPayloadSchema } from '@app-builder/schemas/cases';
import { editInboxFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { editInboxPayloadSchema, type EditInboxPayload };

export const useEditInboxMutation = () => {
  const editInbox = useServerFn(editInboxFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'edit-inbox'],
    mutationFn: async (payload: EditInboxPayload) => editInbox({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
};
