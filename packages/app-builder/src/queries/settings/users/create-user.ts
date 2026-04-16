import { type CreateUserPayload, createUserPayloadSchema } from '@app-builder/schemas/settings';
import { createUserFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createUserPayloadSchema, type CreateUserPayload };

export const useCreateUserMutation = () => {
  const createUser = useServerFn(createUserFn);

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => createUser({ data: payload }),
  });
};
