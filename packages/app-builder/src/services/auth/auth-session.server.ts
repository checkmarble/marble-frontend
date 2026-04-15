import { type CreatedApiKey } from '@app-builder/models/api-keys';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { getServerEnv } from '@app-builder/utils/environment';
import { useSession } from '@tanstack/react-start/server';
import { type Token } from 'marble-api';

export type AuthSessionData = {
  authToken?: Token;
  refreshToken?: string;
  authError?: { message: AuthErrors };
  createdApiKey?: CreatedApiKey;
};

export function useAuthSession() {
  return useSession<AuthSessionData>({
    name: 'user_session',
    password: getServerEnv('SESSION_SECRET'),
    maxAge: Number(getServerEnv('SESSION_MAX_AGE')) || 43200,
    cookie: {
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
