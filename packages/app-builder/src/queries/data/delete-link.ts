import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteLinkPayloadSchema = z.object({
  linkId: z.uuid(),
  perform: z.boolean(),
});

export type DeleteLinkPayload = z.infer<typeof deleteLinkPayloadSchema>;

export type DeleteLinkResponse = { success: true; data: DestroyDataModelReport } | { success: false; errors: string[] };

const endpoint = getRoute('/ressources/data/deleteLink');

export const useDeleteLinkMutation = () => {
  return useMutation({
    mutationKey: ['data', 'delete-link'],
    mutationFn: async (payload: DeleteLinkPayload): Promise<DeleteLinkResponse> => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
