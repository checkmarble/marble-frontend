import { type DeleteUserPayload, deleteUserPayloadSchema } from '@app-builder/schemas/settings';
import { deleteUserFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteUserPayloadSchema, type DeleteUserPayload };

export const useDeleteUserMutation = () => {
  const deleteUser = useServerFn(deleteUserFn);

  return useMutation({
    mutationFn: async (payload: DeleteUserPayload) => deleteUser({ data: payload }),
  });
};
