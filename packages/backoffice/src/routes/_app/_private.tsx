import { StickySentinel } from '@bo/contexts/StickyRoots';
import { useFirebase } from '@bo/hooks/useFirebase';
import { useInterval } from '@bo/hooks/useInterval';
import { getCurrentUserFn, logoutFn, refreshTokenFn } from '@bo/server-fns/auth';
import { getAppConfigFn, updateUserPreferencesFn } from '@bo/server-fns/core';
import { ClientOnly, createFileRoute, Link, Outlet, redirect, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button, MenuCommand, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const Route = createFileRoute('/_app/_private')({
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
  const {
    userPreferences: { theme = 'light' },
  } = Route.useRouteContext();
  const callLogoutFn = useServerFn(logoutFn);
  const { currentUser, appConfig } = Route.useLoaderData();
  const callUpdateUserPreferences = useServerFn(updateUserPreferencesFn);
  const router = useRouter();

  const handleToggleTheme = async () => {
    console.log('test');
    await callUpdateUserPreferences({ data: { theme: theme === 'light' ? 'dark' : 'light' } });
    router.invalidate();
  };

  return (
    <>
      <ClientOnly>{appConfig.auth.provider === 'firebase' ? <TokenRefresher /> : null}</ClientOnly>
      <div className="relative min-h-screen flex flex-col">
        <StickySentinel threshold={1} rootMargin="0px" className="absolute top-0 h-0">
          <div className="sticky top-0 h-15 flex items-center px-lg gap-lg border-grey-border border-b stickied:shadow-sticky-top stickied:backdrop-blur-lg">
            <Link to="/dashboard">Marble Backoffice</Link>
            <div className="flex gap-md items-center">
              <Link to="/licenses" className="data-[status=active]:text-purple-65">
                Licences Management
              </Link>
            </div>
            <div className="flex items-center gap-sm ml-auto">
              <div className="flex gap-xs h-6 items-center">
                <span>{currentUser.actor_identity.email}</span>
              </div>
              <MenuCommand.Menu>
                <MenuCommand.Trigger>
                  <Button variant="secondary" mode="icon" appearance="link">
                    <Icon icon="menu-burger" className="size-4" />
                  </Button>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth sideOffset={4}>
                  <div className="flex flex-col p-sm gap-sm">
                    <button
                      type="button"
                      onClick={() => callLogoutFn()}
                      className="flex gap-sm items-center justify-between"
                    >
                      <span>Logout</span>
                      <Icon icon="logout" className="size-4" />
                    </button>
                    <div className="flex gap-sm items-center justify-between">
                      <span>Theme</span>
                      <div className="flex gap-xs items-center">
                        <Icon icon="light_mode" className="size-4" />
                        <Switch checked={theme === 'dark'} onCheckedChange={handleToggleTheme} />
                        <Icon icon="dark_mode" className="size-4" />
                      </div>
                    </div>
                  </div>
                </MenuCommand.Content>
              </MenuCommand.Menu>
            </div>
          </div>
        </StickySentinel>
        <div className="p-lg">
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
