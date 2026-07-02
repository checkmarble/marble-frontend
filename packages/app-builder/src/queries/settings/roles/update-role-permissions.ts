import { type UpdateRolePermissionsPayload, updateRolePermissionsPayloadSchema } from '@app-builder/schemas/roles';
import { updateRolePermissionsFn } from '@app-builder/server-fns/roles';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type UpdateRolePermissionsPayload, updateRolePermissionsPayloadSchema };

export const useUpdateRolePermissionsMutation = () => {
  const updateRolePermissions = useServerFn(updateRolePermissionsFn);

  return useMutation({
    mutationFn: async (payload: UpdateRolePermissionsPayload) => updateRolePermissions({ data: payload }),
  });
};
