import { type AiSettingSchema } from '@app-builder/models/ai-settings';
import { updateAiSettingsFn } from '@app-builder/server-fns/cases';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useUpdateAiSettings = () => {
  const updateAiSettings = useServerFn(updateAiSettingsFn);

  return useMutation({
    mutationKey: ['cases', 'ai-review', 'update'],
    mutationFn: async (payload: AiSettingSchema) => updateAiSettings({ data: payload }),
  });
};
