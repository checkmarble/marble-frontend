import {
  navigationI18n,
  PermissionsProvider,
  Sidebar,
  type SidebarLinkProps,
} from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import * as Popover from '@radix-ui/react-popover';
import { json, type LoaderArgs } from '@remix-run/node';
import { Form, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, ScrollArea } from 'ui-design-system';
import {
  Arrow2Down,
  Decision,
  Harddrive,
  Lists,
  LogoStandard,
  Logout,
  Scenarios,
  World,
} from 'ui-icons';

import { getRoute } from '../utils/routes';
import { useRefreshToken } from './ressources/auth/refresh';
import { LanguagePicker } from './ressources/user/language';

const LINKS: SidebarLinkProps[] = [
  // { labelTKey: 'navigation:home', to: 'home', Icon: Home },
  {
    labelTKey: 'navigation:scenarios',
    to: getRoute('/scenarios'),
    Icon: Scenarios,
  },
  { labelTKey: 'navigation:lists', to: getRoute('/lists'), Icon: Lists },
  {
    labelTKey: 'navigation:decisions',
    to: getRoute('/decisions'),
    Icon: Decision,
  },
];

const BOTTOM_LINKS: SidebarLinkProps[] = [
  { labelTKey: 'navigation:data', to: getRoute('/data'), Icon: Harddrive },
  { labelTKey: 'navigation:api', to: getRoute('/api'), Icon: World },
];

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  return json({ user });
}

export const handle = {
  i18n: ['common', ...navigationI18n] satisfies Namespace,
};

export default function Builder() {
  const { t } = useTranslation(handle.i18n);
  const { user } = useLoaderData<typeof loader>();

  // Refresh is done in the client because it needs to be done in the browser
  // This is only added here to prevent "auto login" on /login pages... (/logout do not trigger logout from Firebase)
  useRefreshToken();

  return (
    <PermissionsProvider userPermissions={user.permissions}>
      <div className="flex h-full flex-1 flex-row overflow-hidden">
        <header
          className={clsx(
            'bg-grey-02 border-r-grey-10 flex max-h-screen w-full shrink-0 flex-col border-r',
            'max-w-min md:max-w-[235px]'
          )}
        >
          <div className="px-2 pb-9 pt-3">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="hover:bg-grey-05 active:bg-grey-10 group flex w-full flex-row items-center justify-between gap-2 rounded-md p-2">
                  <LogoStandard
                    className="max-h-12"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMinYMid meet"
                    aria-labelledby="marble"
                  />
                  <Arrow2Down
                    className="group-radix-state-open:rotate-180"
                    height="24px"
                    width="24px"
                  />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="bg-grey-00 border-grey-10 animate-slideUpAndFade w-full max-w-xs rounded-md border border-solid p-6 drop-shadow-md will-change-auto"
                  side="bottom"
                  align="start"
                  sideOffset={4}
                >
                  <div className="flex flex-col items-center">
                    {/* TODO(user): add more information when available */}
                    {/* <Avatar
                      className="mb-2"
                      firstName={user.firstName}
                      lastName={user.lastName}
                      src={user.profilePictureUrl}
                    /> */}
                    {/* <p className="text-m mb-1 font-semibold capitalize">{`${user.firstName} ${user.lastName}`}</p> */}
                    <p className="text-s mb-2 font-normal">
                      {user.actorIdentity.email}
                    </p>
                    <LanguagePicker />
                  </div>

                  <div className="mt-6 flex flex-col items-center">
                    <Form action="/ressources/auth/logout" method="POST">
                      <Button variant="secondary" type="submit">
                        <Logout height="24px" width="24px" />
                        {t('common:auth.logout')}
                      </Button>
                    </Form>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          <ScrollArea.Root className="flex flex-1 flex-col" type="auto">
            <ScrollArea.Viewport>
              <Sidebar.Nav className="p-2">
                {LINKS.map((linkProps) => (
                  <li key={linkProps.labelTKey}>
                    <Sidebar.Link {...linkProps} />
                  </li>
                ))}
              </Sidebar.Nav>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
          <Sidebar.Nav className="p-2 pb-4">
            {BOTTOM_LINKS.map((linkProps) => (
              <li key={linkProps.labelTKey}>
                <Sidebar.Link {...linkProps} />
              </li>
            ))}
          </Sidebar.Nav>
        </header>

        <Outlet />
      </div>
    </PermissionsProvider>
  );
}
