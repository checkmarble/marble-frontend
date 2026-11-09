import {
  type GrantOrganizationAccessPayload,
  grantOrganizationAccessPayloadSchema,
} from '@app-builder/schemas/settings';
import { grantOrganizationAccessFn } from '@app-builder/server-fns/settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type GrantOrganizationAccessPayload, grantOrganizationAccessPayloadSchema };

export const useGrantOrganizationAccessMutation = () => {
  const queryClient = useQueryClient();
  const grantOrganizationAccess = useServerFn(grantOrganizationAccessFn);

  return useMutation({
    mutationFn: async (payload: GrantOrganizationAccessPayload) => grantOrganizationAccess({ data: payload }),
    // Covers the users without access and the users' TFA status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization', 'users'] }),
  });
};
