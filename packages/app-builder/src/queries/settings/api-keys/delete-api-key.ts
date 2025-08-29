import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

export const deleteApiKeyPayloadSchema = z.object({
  apiKeyId: z.uuid(),
});

export type DeleteApiKeyPayload = z.infer<typeof deleteApiKeyPayloadSchema>;

const endpoint = getRoute('/ressources/settings/api-keys/delete');

export const useDeleteApiKeyMutation = () => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['settings', 'api-keys', 'delete'],
    mutationFn: async (payload: DeleteApiKeyPayload) => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
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
