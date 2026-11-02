import { type DeleteCustomRolePayload } from '@app-builder/schemas/custom-roles';
import { deleteCustomRoleFn } from '@app-builder/server-fns/custom-roles';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useDeleteCustomRoleMutation = () => {
  const deleteCustomRole = useServerFn(deleteCustomRoleFn);

  return useMutation({
    mutationFn: async (payload: DeleteCustomRolePayload) => deleteCustomRole({ data: payload }),
  });
};
