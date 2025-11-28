import { type AiSettingSchema } from '@app-builder/models/ai-settings';
import { getRoute } from '@app-builder/utils/routes';
import { useQuery } from '@tanstack/react-query';

const endpoint = getRoute('/ressources/cases/get-ai-settings');

export const useGetAiSettingsQuery = () => {
  return useQuery({
    queryKey: ['cases', 'ai-settings'],
    queryFn: async () => {
      const response = await fetch(endpoint);
      return response.json() as Promise<{ settings: AiSettingSchema }>;
    },
  });
};
