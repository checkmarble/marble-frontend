import { AiSettingSchema } from '@app-builder/models/ai-settings';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

export const languages = new Map([
  ['fr-FR', 'French'],
  ['en-US', 'English'],
  ['ar-SA', 'Arabic'],
  ['bn-BD', 'Bengali'],
  ['zh-Hans', 'Chinese'],
  ['hi-IN', 'Hindi'],
  ['ja-JP', 'Japanese'],
  ['pa-IN', 'Lahnda Punjabi'],
  ['pt-BR', 'Portuguese'],
  ['ru-RU', 'Russian'],
  ['es-ES', 'Spanish'],
]);

const endpoint = () => getRoute('/ressources/settings/ai-review');

export const useUpdateLumberJack = () => {
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
