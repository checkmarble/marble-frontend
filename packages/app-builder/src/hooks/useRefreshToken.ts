import { useRefreshTokenMutation } from '@app-builder/queries/auth/refresh-token';
import { logoutFn } from '@app-builder/server-fns/auth';
import { useClientServices } from '@app-builder/services/init-client';
import { useCsrfToken } from '@app-builder/utils/csrf-client';
import { useInterval, useVisibilityChange } from '@app-builder/utils/hooks';

// Totally arbitrary, but we want to refresh the token before it expires
// 20 minutes seems like a good amount of time (assuming it's done in the background while the user is active)
const REFRESH_TOKEN_INTERVAL = 1000 * 60 * 20; // 20 minutes

export function useRefreshToken() {
  const refreshTokenMutation = useRefreshTokenMutation();
  const csrf = useCsrfToken();
  const visibilityState = useVisibilityChange();
  const clientServices = useClientServices();

  useInterval(
    () => {
      const { firebaseIdToken } = clientServices.authenticationClientService.authenticationClientRepository;

      firebaseIdToken().then(
        (idToken: string) => {
          refreshTokenMutation.mutate({ idToken, csrf });
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
