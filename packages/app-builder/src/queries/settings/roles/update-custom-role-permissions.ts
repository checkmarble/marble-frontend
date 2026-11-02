import { type UpdateCustomRolePermissionsPayload } from '@app-builder/schemas/custom-roles';
import { updateCustomRolePermissionsFn } from '@app-builder/server-fns/custom-roles';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUpdateCustomRolePermissionsMutation = () => {
  const updateCustomRolePermissions = useServerFn(updateCustomRolePermissionsFn);

  return useMutation({
    mutationFn: async (payload: UpdateCustomRolePermissionsPayload) => updateCustomRolePermissions({ data: payload }),
  });
};
