import { env } from '@bo/env';
import { useSession } from '@tanstack/react-start/server';

type UserPreferences = {
  theme: 'dark' | 'light';
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
