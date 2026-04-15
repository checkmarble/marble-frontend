import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { setToast } from '@app-builder/services/toast.server';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const setLanguagePayloadSchema = z.object({
  preferredLanguage: z.enum(supportedLngs),
});

export type SetLanguagePayload = z.infer<typeof setLanguagePayloadSchema>;

export const setLanguageFn = createServerFn({ method: 'POST' })
  .middleware([servicesMiddleware])
  .inputValidator(setLanguagePayloadSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.services.i18nextService.setLanguage(data.preferredLanguage);
    } catch {
      await setToast({ type: 'error', messageKey: 'common:errors.unknown' });
      throw new Error('Failed to set language');
    }
  });
