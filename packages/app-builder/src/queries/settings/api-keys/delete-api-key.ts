import { type DeleteApiKeyPayload, deleteApiKeyPayloadSchema } from '@app-builder/schemas/settings';
import { deleteApiKeyFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { deleteApiKeyPayloadSchema, type DeleteApiKeyPayload };

export const useDeleteApiKeyMutation = () => {
  const deleteApiKey = useServerFn(deleteApiKeyFn);

  return useMutation({
    mutationKey: ['settings', 'api-keys', 'delete'],
    mutationFn: async (payload: DeleteApiKeyPayload) => deleteApiKey({ data: payload }),
  });
};
