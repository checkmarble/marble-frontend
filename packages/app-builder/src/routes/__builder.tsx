import {
  navigationI18n,
  Sidebar,
  type SidebarLinkProps,
} from '@app-builder/components';
import * as Popover from '@radix-ui/react-popover';
import { json, type LoaderArgs } from '@remix-run/node';
import { Form, Outlet, useLoaderData } from '@remix-run/react';
import { Button, ScrollArea } from '@ui-design-system';
import {
  Arrow2Down,
  Decision,
  Lists,
  LogoStandard,
  Logout,
  Scenarios,
} from '@ui-icons';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { authenticator } from '../services/auth/auth.server';
import { getRoute } from '../services/routes';
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
  // { labelTKey: 'navigation:analytics', to: 'analytics', Icon: Analytics },
  // { labelTKey: 'navigation:history', to: 'history', Icon: History },
];

const BOTTOM_LINKS: SidebarLinkProps[] = [
  // { labelTKey: 'navigation:settings', to: 'settings', Icon: Settings },
  // { labelTKey: 'navigation:help-center', to: 'help-center', Icon: Helpcenter },
];

export interface UserResponse {
  id?: string;
  orgId: string;
  email?: string;
  preferredLanguage?: string;
  profilePictureUrl?: string;
}

export async function loader({ request }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const { credentials } = await apiClient.getCredentials();

  const user: UserResponse = {
    id: credentials.actor_identity.user_id,
    orgId: credentials.organization_id,
    email: credentials.actor_identity.email,
  };

  return json({ user });
}

export const handle = {
  i18n: ['common', ...navigationI18n] satisfies Namespace,
};

export default function Builder() {
  const { t } = useTranslation(handle.i18n);
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
                  {/* TODO(user): add more information when available */}
                  {/* <Avatar
                    className="mb-2"
                    firstName={user.firstName}
                    lastName={user.lastName}
                    src={user.profilePictureUrl}
                  /> */}
                  {/* <p className="text-m mb-1 font-semibold capitalize">{`${user.firstName} ${user.lastName}`}</p> */}
                  <p className="text-s mb-2 font-normal">{user.email}</p>
                  <LanguagePicker />
                </div>

                <div className="mt-6 flex flex-col items-center">
                  <Form action="/ressources/auth/logout" method="POST">
                    <Button variant="secondary">
                      <Logout height="24px" width="24px" />
                      {t('common:auth.logout')}
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
