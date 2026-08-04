import { UpdateInboxesSlaPayload, updateInboxesSlaPayloadSchema } from '@app-builder/schemas/cases';
import { updateInboxesSlaFn } from '@app-builder/server-fns/cases';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type UpdateInboxesSlaPayload, updateInboxesSlaPayloadSchema };

export const useUpdateInboxesSlaMutation = () => {
  const updateInboxesSla = useServerFn(updateInboxesSlaFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['cases', 'inboxes', 'update-sla'],
    mutationFn: async (payload: UpdateInboxesSlaPayload) => updateInboxesSla({ data: payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cases', 'inboxes'] });
    },
  });
};
