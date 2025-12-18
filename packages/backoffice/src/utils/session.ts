import { env } from '@bo/env';
import { useSession } from '@tanstack/react-start/server';
import { marblecoreApi } from 'marble-api';

type AuthSession = {
  authToken: marblecoreApi.Token;
};

export function useAuthSession() {
  return useSession<AuthSession>({
    name: 'auth-session',
    password: env.SESSION_SECRET,

    cookie: {
      secure: false,
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
