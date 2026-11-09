import {
  type EditOrganizationUserForm,
  editOrganizationUserFormSchema,
  type UpdateOrganizationUserPayload,
} from '@app-builder/schemas/settings';
import { updateOrganizationUserFn } from '@app-builder/server-fns/settings';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type EditOrganizationUserForm, editOrganizationUserFormSchema };

export const useUpdateOrganizationUserMutation = () => {
  const queryClient = useQueryClient();
  const updateOrganizationUser = useServerFn(updateOrganizationUserFn);

  return useMutation({
    mutationFn: async (payload: UpdateOrganizationUserPayload) => updateOrganizationUser({ data: payload }),
    // Covers the users' TFA status
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization', 'users'] }),
  });
};
