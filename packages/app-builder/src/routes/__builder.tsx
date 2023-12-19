import {
  navigationI18n,
  PermissionsProvider,
  SidebarButton,
  SidebarLink,
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
import { type SVGProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, ScrollArea } from 'ui-design-system';
import {
  Arrow2Down,
  ArrowRight,
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

  const [expanded, setExpanded] = useState(true);

  return (
    <PermissionsProvider userPermissions={user.permissions}>
      <OrganizationUsersContextProvider orgUsers={orgUsers}>
        <OrganizationTagsContextProvider orgTags={orgTags}>
          <div className="flex h-full flex-1 flex-row overflow-hidden">
            <header
              aria-expanded={expanded}
              className="bg-grey-00 border-r-grey-10 group/nav flex max-h-screen w-14 shrink-0 flex-col border-r transition-all aria-expanded:w-[235px]"
            >
              <div className="h-24 px-2 pt-3">
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className="hover:bg-grey-05 active:bg-grey-10 group flex w-full flex-row items-center justify-between gap-2 overflow-hidden rounded-md p-2">
                      <div className="inline-flex">
                        <LogoStandard
                          width={undefined}
                          height={undefined}
                          aria-labelledby="marble"
                          viewBox="0 0 80 80"
                          className="w-6 shrink-0 transition-all group-aria-expanded/nav:w-12"
                        />
                        <LogoStandard
                          width={undefined}
                          height={undefined}
                          aria-labelledby="marble"
                          viewBox="80 0 277 80"
                          className="w-32 opacity-0 transition-opacity group-aria-expanded/nav:opacity-100"
                        />
                      </div>
                      <Arrow2Down
                        className="group-radix-state-open:rotate-180 opacity-0 transition-opacity group-aria-expanded/nav:opacity-100"
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
                  <nav className="p-2">
                    <ul className="flex flex-col gap-2">
                      <li>
                        <SidebarLink
                          labelTKey="navigation:scenarios"
                          to={getRoute('/scenarios')}
                          Icon={Scenarios}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:lists"
                          to={getRoute('/lists')}
                          Icon={Lists}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:decisions"
                          to={getRoute('/decisions')}
                          Icon={Decision}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:scheduledExecutions"
                          to={getRoute('/scheduled-executions')}
                          Icon={ScheduledExecution}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:caseManager"
                          to={getRoute('/cases')}
                          Icon={CaseManager}
                        />
                      </li>
                    </ul>
                  </nav>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar>
                  <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
              <nav className="p-2 pb-4">
                <ul className="flex flex-col gap-2">
                  <li>
                    <SidebarLink
                      labelTKey="navigation:data"
                      to={getRoute('/data')}
                      Icon={Harddrive}
                    />
                  </li>
                  <li>
                    <SidebarLink
                      labelTKey="navigation:api"
                      to={getRoute('/api')}
                      Icon={World}
                    />
                  </li>
                  {isAdmin(user) ? (
                    <li key="navigation:settings">
                      <SidebarLink
                        labelTKey="navigation:settings"
                        to={getRoute('/settings')}
                        Icon={Settings}
                      />
                    </li>
                  ) : null}
                  <li>
                    <ChatlioWidget user={user} organization={organization} />
                  </li>
                  <li>
                    <SidebarButton
                      onClick={() => {
                        setExpanded((expanded) => !expanded);
                      }}
                      labelTKey={
                        expanded
                          ? 'navigation:collapsed'
                          : 'navigation:expanded'
                      }
                      Icon={ExpandedIcon}
                    />
                  </li>
                </ul>
              </nav>
            </header>

            <Outlet />
          </div>
        </OrganizationTagsContextProvider>
      </OrganizationUsersContextProvider>
    </PermissionsProvider>
  );
}

function ExpandedIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <ArrowRight
      className={clsx(
        'transition-transform group-aria-expanded/nav:rotate-180',
        className,
      )}
      {...props}
    />
  );
}
