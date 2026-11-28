import { useRefreshTokenMutation } from '@app-builder/queries/auth/refresh-token';
import { logoutFn } from '@app-builder/server-fns/auth';
import { useFirebaseAuthClient } from '@app-builder/services/auth/firebase-auth-client';
import { useCsrfToken } from '@app-builder/utils/csrf-client';
import { useInterval, useVisibilityChange } from '@app-builder/utils/hooks';
import { withOrganizationChangeLock } from '@app-builder/utils/organization-change-lock';

// Totally arbitrary, but we want to refresh the token before it expires
// 20 minutes seems like a good amount of time (assuming it's done in the background while the user is active)
const REFRESH_TOKEN_INTERVAL = 1000 * 60 * 20; // 20 minutes

export function useRefreshToken() {
  const refreshTokenMutation = useRefreshTokenMutation();
  const csrf = useCsrfToken();
  const visibilityState = useVisibilityChange();
  const authClient = useFirebaseAuthClient();

  useInterval(
    () => {
      const { firebaseIdToken } = authClient;

      firebaseIdToken().then(
        (idToken: string) => {
          void withOrganizationChangeLock(() => refreshTokenMutation.mutateAsync({ idToken, csrf })).catch(
            () => undefined,
          );
        },
        () => {
          void logoutFn({
            data: { redirectTo: `${window.location.pathname}${window.location.search}` },
          });
        },
      );
    },
    {
      delay: visibilityState === 'hidden' ? null : REFRESH_TOKEN_INTERVAL,
      executeImmediately: true,
    },
  );
}
