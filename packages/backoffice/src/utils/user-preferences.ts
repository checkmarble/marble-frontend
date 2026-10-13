import { env } from '@bo/env';
import type { StoredDashboardPreferences } from '@bo/utils/dashboard-preferences';
import { useSession } from '@tanstack/react-start/server';

export type UserPreferences = {
  theme: 'dark' | 'light';
  dashboard?: StoredDashboardPreferences;
};

export function useUserPreferences() {
  return useSession<UserPreferences>({
    name: 'user-preferences',
    password: env.SESSION_SECRET,

    cookie: {
      secure: false,
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
