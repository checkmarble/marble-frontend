import { clientServices } from '@app-builder/services/init.client';
import { initServerServices } from '@app-builder/services/init.server';
import { useInterval, useVisibilityChange } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher, useNavigate } from '@remix-run/react';
import { useAuthenticityToken } from 'remix-utils/csrf/react';

export function loader() {
  return redirect(getRoute('/sign-in'));
}

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);
  return await authService.refresh(request, {
    failureRedirect: getRoute('/ressources/auth/logout'),
  });
}

// Totally arbitrary, but we want to refresh the token before it expires
// 20 minutes seems like a good amount of time (assuming it's done in the background while the user is active)
const REFRESH_TOKEN_INTERVAL = 1000 * 60 * 20; // 20 minutes

export function useRefreshToken() {
  const { submit } = useFetcher();
  const csrf = useAuthenticityToken();
  const visibilityState = useVisibilityChange();
  const navigate = useNavigate();

  useInterval(
    () => {
      const { firebaseIdToken } =
        clientServices.authenticationClientService.authenticationClientRepository;

      firebaseIdToken().then(
        (idToken: string) => {
          submit(
            { idToken, csrf },
            { method: 'POST', action: getRoute('/ressources/auth/refresh') },
          );
        },
        () => {
          let redirectUrl = getRoute('/ressources/auth/logout');
          if (window) {
            const searchParams = new URLSearchParams();
            searchParams.set('redirectTo', `${window.location.pathname}${window.location.search}`);
            redirectUrl = `${redirectUrl}?${searchParams.toString()}`;
          }
          navigate(redirectUrl);
        },
      );
    },
    {
      delay: visibilityState === 'hidden' ? null : REFRESH_TOKEN_INTERVAL,
      executeImmediately: true,
    },
  );
}
