import { type CreateCustomRolePayload } from '@app-builder/schemas/custom-roles';
import { createCustomRoleFn } from '@app-builder/server-fns/custom-roles';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useCreateCustomRoleMutation = () => {
  const createCustomRole = useServerFn(createCustomRoleFn);

  return useMutation({
    mutationFn: async (payload: CreateCustomRolePayload) => createCustomRole({ data: payload }),
  });
};
