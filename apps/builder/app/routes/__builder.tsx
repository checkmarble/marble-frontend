import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import * as Popover from '@radix-ui/react-popover';
import {
  Arrow2Down,
  Lists,
  LogoStandard,
  Logout,
  Scenarios,
} from '@marble-front/ui/icons';
import { Avatar, Button, ScrollArea } from '@marble-front/ui/design-system';
import { useTranslation } from 'react-i18next';
import { Form, Outlet, useLoaderData } from '@remix-run/react';
import {
  Sidebar,
  type SidebarLinkProps,
  navigationI18n,
} from '@marble-front/builder/components/Navigation';
import clsx from 'clsx';
import { authenticator } from '../services/auth/auth.server';

const LINKS: SidebarLinkProps[] = [
  // { labelTKey: 'home', to: 'home', Icon: Home },
  { labelTKey: 'scenarios', to: 'scenarios', Icon: Scenarios },
  { labelTKey: 'lists', to: 'lists', Icon: Lists },
  // { labelTKey: 'analytics', to: 'analytics', Icon: Analytics },
  // { labelTKey: 'history', to: 'history', Icon: History },
];

const BOTTOM_LINKS: SidebarLinkProps[] = [
  // { labelTKey: 'settings', to: 'settings', Icon: Settings },
  // { labelTKey: 'help-center', to: 'help-center', Icon: Helpcenter },
];

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  return json({ user });
}

export const handle = {
  i18n: ['common', ...navigationI18n],
};

export default function Builder() {
  const { t } = useTranslation('common');
  const { user } = useLoaderData<typeof loader>();

  return (
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
                  <Avatar
                    className="mb-2"
                    firstName={user.name.givenName}
                    lastName={user.name.familyName}
                    src={user.photos?.[0]?.value}
                  />
                  <p className="text-text-m-semibold mb-1 capitalize">{`${user.name.givenName} ${user.name.familyName}`}</p>
                  <p className="text-text-s-regular">
                    {user.emails?.[0]?.value}
                  </p>
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <Form action="/auth/logout" method="post">
                    <Button variant="secondary">
                      <Logout height="24px" width="24px" />
                      {t('auth.logout')}
                    </Button>
                  </Form>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        <ScrollArea.Root className="flex flex-1 flex-col p-2" type="auto">
          <ScrollArea.Viewport>
            <Sidebar.Nav>
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
  );
}
