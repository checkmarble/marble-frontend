import { type AiSettingSchema } from '@app-builder/models/ai-settings';
import { getAiSettingsFn } from '@app-builder/server-fns/cases';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useGetAiSettingsQuery = () => {
  const getAiSettings = useServerFn(getAiSettingsFn);

  return useQuery({
    queryKey: ['cases', 'ai-settings'],
    queryFn: async () => {
      const result = await getAiSettings();
      return result as { settings: AiSettingSchema };
    },
  });
};
