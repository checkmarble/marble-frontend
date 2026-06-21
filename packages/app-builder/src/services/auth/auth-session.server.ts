import { type CreatedApiKey } from '@app-builder/models/api-keys';
import { type AuthErrors } from '@app-builder/models/auth-errors';
import { getServerEnv } from '@app-builder/utils/environment';
import { useSession } from '@tanstack/react-start/server';
import { type Token } from 'marble-api';

export type AuthSessionData = {
  authToken?: Token;
  /** Provider refresh token (OIDC or Firebase) used to refresh the Marble token server-side during SSR. */
  refreshToken?: string;
  /** Epoch ms of the last authenticated request, used to enforce the sliding idle timeout. */
  lastActivityAt?: number;
  authError?: { message: AuthErrors };
  createdApiKey?: CreatedApiKey;
};

// Absolute session lifetime (cookie maxAge). The idle timeout is enforced
// in-app via `lastActivityAt`; see `isAuthenticated`.
const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function useAuthSession() {
  return useSession<AuthSessionData>({
    name: 'user_session',
    password: getServerEnv('SESSION_SECRET'),
    maxAge: Number(getServerEnv('SESSION_MAX_AGE')) || DEFAULT_SESSION_MAX_AGE,
    cookie: {
      sameSite: 'lax',
      httpOnly: true,
    },
  });
}
