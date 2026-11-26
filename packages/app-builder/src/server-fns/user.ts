import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { setLanguage } from '@app-builder/services/i18n/i18next.server';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const setLanguagePayloadSchema = z.object({
  preferredLanguage: z.enum(supportedLngs),
});

export type SetLanguagePayload = z.infer<typeof setLanguagePayloadSchema>;

export const setLanguageFn = createServerFn({ method: 'POST' })
  .validator(setLanguagePayloadSchema)
  .handler(async ({ data }) => {
    try {
      await setLanguage(data.preferredLanguage);
    } catch {
      throw new Error('Failed to set language');
    }
  });
