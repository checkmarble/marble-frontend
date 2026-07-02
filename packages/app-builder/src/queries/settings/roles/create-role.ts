import { type CreateRolePayload, createRolePayloadSchema } from '@app-builder/schemas/roles';
import { createRoleFn } from '@app-builder/server-fns/roles';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { type CreateRolePayload, createRolePayloadSchema };

export const useCreateRoleMutation = () => {
  const createRole = useServerFn(createRoleFn);

  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => createRole({ data: payload }),
  });
};
