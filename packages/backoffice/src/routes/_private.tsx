import { StickySentinel } from '@bo/contexts/StickyRoots';
import { useFirebase } from '@bo/hooks/useFirebase';
import { useInterval } from '@bo/hooks/useInterval';
import { getCurrentUserFn, logoutFn, refreshTokenFn } from '@bo/server-fns/auth';
import { getAppConfigFn } from '@bo/server-fns/core';
import { ClientOnly, createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const Route = createFileRoute('/_private')({
  beforeLoad: async () => {
    const currentUser = await getCurrentUserFn();

    if (!currentUser) {
      throw redirect({ to: '/sign-in' });
    }

    // TODO: If user is not a MARBLE_ADMIN, logout the user and redirect to /sign-in with an error message
    if (currentUser.role !== 'MARBLE_ADMIN') {
      await logoutFn();
      throw redirect({ to: '/sign-in' });
    }
  },
  loader: async () => {
    const currentUser = await getCurrentUserFn();
    const appConfig = await getAppConfigFn();

    return { currentUser, appConfig };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const callLogoutFn = useServerFn(logoutFn);
  const { currentUser, appConfig } = Route.useLoaderData();

  return (
    <>
      <ClientOnly>{appConfig.auth.provider === 'firebase' ? <TokenRefresher /> : null}</ClientOnly>
      <div className="relative">
        <StickySentinel threshold={1} rootMargin="0px" className="absolute top-0 h-0">
          <div className="sticky top-0 h-15 flex items-center px-v2-lg gap-v2-lg border-grey-border border-b stickied:shadow-sticky-top stickied:backdrop-blur-lg">
            <Link to="/dashboard">Marble Backoffice</Link>
            <div>
              <Link to="/organizations" className="data-[status=active]:text-purple-65">
                Organizations
              </Link>
            </div>
            <div className="flex items-center gap-v2-sm ml-auto">
              <div className="flex flex-col gap-v2-xs">
                <span>{currentUser.actor_identity.email}</span>
              </div>
              <div>
                <Button variant="secondary" appearance="stroked" mode="icon" onClick={() => callLogoutFn()}>
                  <Icon icon="logout" className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </StickySentinel>
        <div className="p-v2-lg">
          <Outlet />
        </div>
      </div>
    </>
  );
}

const TokenRefresher = () => {
  const firebaseClient = useFirebase();
  const callRefreshTokenFn = useServerFn(refreshTokenFn);
  const callLogoutFn = useServerFn(logoutFn);

  useInterval(
    () => {
      firebaseClient.getIdToken().then(
        (idToken) => {
          callRefreshTokenFn({ data: { idToken } });
        },
        () => {
          callLogoutFn();
        },
      );
    },
    { delay: 1000 * 60 * 20, executeImmediately: true },
  );
  return null;
};
