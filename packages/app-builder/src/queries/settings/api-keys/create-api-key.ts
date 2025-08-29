import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { apiKeyRoleOptions } from '@app-builder/models/api-keys';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const createApiKeyPayloadSchema = z.object({
  description: z.string().min(1),
  role: z.enum(apiKeyRoleOptions),
});

export type CreateApiKeyPayload = z.infer<typeof createApiKeyPayloadSchema>;

const endpoint = getRoute('/ressources/settings/api-keys/create');

export const useCreateApiKeyMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'api-keys', 'create'],
    mutationFn: async (payload: CreateApiKeyPayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
