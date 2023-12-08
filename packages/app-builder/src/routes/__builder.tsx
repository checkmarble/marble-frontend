import {
  navigationI18n,
  PermissionsProvider,
  Sidebar,
  type SidebarLinkProps,
} from '@app-builder/components';
import { isAdmin } from '@app-builder/models';
import { ChatlioWidget } from '@app-builder/services/chatlio/ChatlioWidget';
import { chatlioScript } from '@app-builder/services/chatlio/script';
import { serverServices } from '@app-builder/services/init.server';
import { OrganizationTagsContextProvider } from '@app-builder/services/organization/organization-tags';
import { OrganizationUsersContextProvider } from '@app-builder/services/organization/organization-users';
import {
  segment,
  useSegmentIdentification,
} from '@app-builder/services/segment';
import { getFullName } from '@app-builder/services/user';
import * as Popover from '@radix-ui/react-popover';
import { json, type LoaderArgs } from '@remix-run/node';
import { Form, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, ScrollArea } from 'ui-design-system';
import {
  Arrow2Down,
  CaseManager,
  Decision,
  Harddrive,
  Lists,
  LogoStandard,
  Logout,
  Scenarios,
  ScheduledExecution,
  Settings,
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
  {
    labelTKey: 'navigation:scheduledExecutions',
    to: getRoute('/scheduled-executions'),
    Icon: ScheduledExecution,
  },
  {
    labelTKey: 'navigation:caseManager',
    to: getRoute('/cases'),
    Icon: CaseManager,
  },
];

const BOTTOM_LINKS: SidebarLinkProps[] = [
  { labelTKey: 'navigation:data', to: getRoute('/data'), Icon: Harddrive },
  { labelTKey: 'navigation:api', to: getRoute('/api'), Icon: World },
];

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { user, organization } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const [organizationDetail, orgUsers, orgTags] = await Promise.all([
    organization.getCurrentOrganization(),
    organization.listUsers(),
    organization.listTags(),
  ]);

  return json({ user, orgUsers, organization: organizationDetail, orgTags });
}

export const handle = {
  i18n: ['common', ...navigationI18n] satisfies Namespace,
  scripts: () => [chatlioScript],
};

export default function Builder() {
  const { t } = useTranslation(handle.i18n);
  const { user, orgUsers, organization, orgTags } =
    useLoaderData<typeof loader>();
  useSegmentIdentification(user);

  // Refresh is done in the client because it needs to be done in the browser
  // This is only added here to prevent "auto login" on /login pages... (/logout do not trigger logout from Firebase)
  useRefreshToken();

  return (
    <PermissionsProvider userPermissions={user.permissions}>
      <OrganizationUsersContextProvider orgUsers={orgUsers}>
        <OrganizationTagsContextProvider orgTags={orgTags}>
          <div className="flex h-full flex-1 flex-row overflow-hidden">
            <header
              className={clsx(
                'bg-grey-02 border-r-grey-10 flex max-h-screen w-full shrink-0 flex-col border-r',
                'max-w-min md:max-w-[235px]',
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
                        <Avatar
                          className="mb-2"
                          size="xl"
                          firstName={user.actorIdentity.firstName}
                          lastName={user.actorIdentity.lastName}
                          // src={user.profilePictureUrl}
                        />
                        {getFullName(user.actorIdentity) ? (
                          <p className="text-m mb-1 font-semibold capitalize">
                            {getFullName(user.actorIdentity)}
                          </p>
                        ) : null}
                        <p className="text-s mb-2 font-normal">
                          {user.actorIdentity.email}
                        </p>
                        <p className="text-grey-50 m-2 text-xs font-normal">
                          {organization.name}
                        </p>
                        <LanguagePicker />
                      </div>

                      <div className="mt-6 flex flex-col items-center">
                        <Form action="/ressources/auth/logout" method="POST">
                          <Button
                            variant="secondary"
                            type="submit"
                            onClick={() => {
                              void segment.reset();
                            }}
                          >
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
                {isAdmin(user) ? (
                  <li key="navigation:settings">
                    <Sidebar.Link
                      labelTKey="navigation:settings"
                      to={getRoute('/settings')}
                      Icon={Settings}
                    />
                  </li>
                ) : null}
                <ChatlioWidget user={user} organization={organization} />
              </Sidebar.Nav>
            </header>

            <Outlet />
          </div>
        </OrganizationTagsContextProvider>
      </OrganizationUsersContextProvider>
    </PermissionsProvider>
  );
}
