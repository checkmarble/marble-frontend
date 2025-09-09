import { AiSettingSchema } from '@app-builder/models/ai-settings';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

const endpoint = () => getRoute('/ressources/settings/ai-review');

export const useUpdateAiSettings = () => {
  return useMutation({
    mutationKey: ['settings', 'llumber-jack', 'update'],
    mutationFn: async (payload: AiSettingSchema) => {
      const response = await fetch(endpoint(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
