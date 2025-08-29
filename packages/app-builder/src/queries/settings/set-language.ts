import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import z from 'zod/v4';

export const setLanguagePayloadSchema = z.object({
  preferredLanguage: z.enum(supportedLngs),
});

export type SetLanguagePayload = z.infer<typeof setLanguagePayloadSchema>;

const endpoint = getRoute('/ressources/user/language');

export const useSetLanguageMutation = () => {
  return useMutation({
    mutationKey: ['settings', 'set-language'],
    mutationFn: async (payload: SetLanguagePayload) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return response.json();
    },
  });
};
