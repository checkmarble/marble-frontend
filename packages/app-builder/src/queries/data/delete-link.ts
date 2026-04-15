import { type DestroyDataModelReport } from '@app-builder/models/data-model';
import { type DeleteLinkPayload, deleteLinkPayloadSchema } from '@app-builder/schemas/data';
import { deleteLinkFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteLinkPayloadSchema, type DeleteLinkPayload };

export type DeleteLinkResponse = { success: true; data: DestroyDataModelReport } | { success: false; errors: string[] };

export const useDeleteLinkMutation = () => {
  const deleteLink = useServerFn(deleteLinkFn);

  return useMutation({
    mutationKey: ['data', 'delete-link'],
    mutationFn: async (payload: DeleteLinkPayload): Promise<DeleteLinkResponse> =>
      deleteLink({ data: payload }) as Promise<DeleteLinkResponse>,
  });
};
