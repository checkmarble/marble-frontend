import {
  type RevokeOrganizationAccessPayload,
  revokeOrganizationAccessPayloadSchema,
} from '@app-builder/schemas/settings';
import { revokeOrganizationAccessFn } from '@app-builder/server-fns/settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type RevokeOrganizationAccessPayload, revokeOrganizationAccessPayloadSchema };

export const useRevokeOrganizationAccessMutation = () => {
  const queryClient = useQueryClient();
  const revokeOrganizationAccess = useServerFn(revokeOrganizationAccessFn);

  return useMutation({
    mutationFn: async (payload: RevokeOrganizationAccessPayload) => revokeOrganizationAccess({ data: payload }),
    // Covers the users without access and the users' TFA status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization', 'users'] }),
  });
};
