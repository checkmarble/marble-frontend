import { type CreateApiKeyPayload, createApiKeyPayloadSchema } from '@app-builder/schemas/settings';
import { createApiKeyFn } from '@app-builder/server-fns/settings';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export { createApiKeyPayloadSchema, type CreateApiKeyPayload };

export const useCreateApiKeyMutation = () => {
  const createApiKey = useServerFn(createApiKeyFn);

  return useMutation({
    mutationKey: ['settings', 'api-keys', 'create'],
    mutationFn: async (payload: CreateApiKeyPayload) => createApiKey({ data: payload }),
  });
};
