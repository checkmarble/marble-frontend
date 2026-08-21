import { env } from '@bo/env';
import { useUserPreferences } from '@bo/utils/user-preferences';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';
import { z } from 'zod/v4';

export const getAppConfigFn = createServerFn({ method: 'GET' }).handler(async () => {
  const appConfig = await marblecoreApi.getAppConfig({ baseUrl: env.API_BASE_URL });
  return appConfig;
});

export const getUserPreferencesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const userPreferencesCookie = await useUserPreferences();
  return userPreferencesCookie.data;
});

export const updateUserPreferencesFn = createServerFn({ method: 'POST' })
  .validator(z.object({ theme: z.enum(['light', 'dark']).optional() }))
  .handler(async ({ data }) => {
    const userPreferencesCookie = await useUserPreferences();

    await userPreferencesCookie.update(data);
  });
