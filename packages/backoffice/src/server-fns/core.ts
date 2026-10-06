import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { dashboardPreferencesPatchSchema } from '@bo/schemas/dashboard';
import {
  getDashboardPreferences,
  getStoredDashboardPreferences,
  patchDashboardPreferences,
} from '@bo/utils/dashboard-preferences';
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
  return {
    ...userPreferencesCookie.data,
    theme: userPreferencesCookie.data.theme === 'dark' ? 'dark' : 'light',
    dashboard: getStoredDashboardPreferences(userPreferencesCookie.data.dashboard),
  };
});

export const updateUserPreferencesFn = createServerFn({ method: 'POST' })
  .validator(z.object({ theme: z.enum(['light', 'dark']).optional() }))
  .handler(async ({ data }) => {
    const userPreferencesCookie = await useUserPreferences();

    await userPreferencesCookie.update(data);
  });

// Dashboard selections belong to the authenticated account, never to a client supplied identity.
export const updateDashboardPreferencesFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(dashboardPreferencesPatchSchema)
  .handler(async ({ data, context }) => {
    const { credentials } = await marblecoreApi.getCredentials({ baseUrl: env.API_BASE_URL, fetch: context.authFetch });
    const userId = credentials.actor_identity.user_id;
    if (!userId) throw new Error('Dashboard preferences require an authenticated user');

    const userPreferencesCookie = await useUserPreferences();
    const current = getDashboardPreferences(userPreferencesCookie.data.dashboard, userId);
    await userPreferencesCookie.update({ dashboard: { userId, ...patchDashboardPreferences(current, data) } });
  });
