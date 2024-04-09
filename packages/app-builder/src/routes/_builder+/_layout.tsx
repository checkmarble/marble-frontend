import {
  ErrorComponent,
  navigationI18n,
  PermissionsProvider,
  SidebarButton,
  SidebarLink,
} from '@app-builder/components';
import { isAdmin, isMarbleAdmin } from '@app-builder/models';
import { useRefreshToken } from '@app-builder/routes/ressources+/auth+/refresh';
import { LanguagePicker } from '@app-builder/routes/ressources+/user+/language';
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
import { getClientEnv } from '@app-builder/utils/environment';
import { conflict } from '@app-builder/utils/http/http-responses';
import { CONFLICT } from '@app-builder/utils/http/http-status-codes';
import { getRoute } from '@app-builder/utils/routes';
import * as Popover from '@radix-ui/react-popover';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, ScrollArea, Tag } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user, organization } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  if (isMarbleAdmin(user)) {
    throw conflict("Marble Admins can't access the app builder.");
  }

  const [organizationDetail, orgUsers, orgTags] = await Promise.all([
    organization.getCurrentOrganization(),
    organization.listUsers(),
    organization.listTags(),
  ]);

  return json({ user, orgUsers, organization: organizationDetail, orgTags });
}

export const handle = {
  i18n: ['common', ...navigationI18n] satisfies Namespace,
  scripts: () => [
    ...(getClientEnv('CHATLIO_WIDGET_ID') ? [chatlioScript] : []),
  ],
};

export default function Builder() {
  const { t } = useTranslation(handle.i18n);
  const { user, orgUsers, organization, orgTags } =
    useLoaderData<typeof loader>();
  useSegmentIdentification(user);

  // Refresh is done in the JSX because it needs to be done in the browser
  // This is only added here to prevent "auto sign-in" on /sign-in pages... (/logout do not trigger logout from Firebase)
  useRefreshToken();

  const [expanded, setExpanded] = useState(true);
  const chatlioWidgetId = getClientEnv('CHATLIO_WIDGET_ID');

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
                      <div className="inline-flex items-center gap-5">
                        <Logo
                          logo="logo"
                          aria-labelledby="marble logo"
                          className="size-6 shrink-0 transition-all group-aria-expanded/nav:size-12"
                        />
                        <Logo
                          logo="marble"
                          aria-labelledby="marble"
                          className="h-6 w-full opacity-0 transition-opacity group-aria-expanded/nav:opacity-100"
                        />
                      </div>
                      <Icon
                        icon="arrow-2-down"
                        className="group-radix-state-open:rotate-180 size-6 shrink-0 opacity-0 transition-opacity group-aria-expanded/nav:opacity-100"
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
                        <Tag border="square">{user.role}</Tag>
                        <p className="text-grey-50 m-2 text-xs font-normal">
                          {organization.name}
                        </p>
                        <LanguagePicker />
                      </div>

                      <div className="mt-6 flex flex-col items-center">
                        <Form
                          action={getRoute('/ressources/auth/logout')}
                          method="POST"
                        >
                          <Button
                            variant="secondary"
                            type="submit"
                            onClick={() => {
                              void segment.reset();
                            }}
                          >
                            <Icon icon="logout" className="size-5" />
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
                          to={getRoute('/scenarios/')}
                          Icon={(props) => <Icon icon="scenarios" {...props} />}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:lists"
                          to={getRoute('/lists/')}
                          Icon={(props) => <Icon icon="lists" {...props} />}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:decisions"
                          to={getRoute('/decisions/')}
                          Icon={(props) => <Icon icon="decision" {...props} />}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:scheduledExecutions"
                          to={getRoute('/scheduled-executions')}
                          Icon={(props) => (
                            <Icon icon="scheduled-execution" {...props} />
                          )}
                        />
                      </li>
                      <li>
                        <SidebarLink
                          labelTKey="navigation:caseManager"
                          to={getRoute('/cases/')}
                          Icon={(props) => (
                            <Icon icon="case-manager" {...props} />
                          )}
                        />
                      </li>
                      {user.permissions.canReadAnalytics ? (
                        <li>
                          <SidebarLink
                            labelTKey="navigation:analytics"
                            to={getRoute('/analytics')}
                            Icon={(props) => (
                              <Icon icon="analytics" {...props} />
                            )}
                          />
                        </li>
                      ) : null}
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
                      Icon={(props) => <Icon icon="harddrive" {...props} />}
                    />
                  </li>
                  <li>
                    <SidebarLink
                      labelTKey="navigation:api"
                      to={getRoute('/api')}
                      Icon={(props) => <Icon icon="world" {...props} />}
                    />
                  </li>
                  {isAdmin(user) ? (
                    <li key="navigation:settings">
                      <SidebarLink
                        labelTKey="navigation:settings"
                        to={getRoute('/settings')}
                        Icon={(props) => <Icon icon="settings" {...props} />}
                      />
                    </li>
                  ) : null}
                  {chatlioWidgetId ? (
                    <li>
                      <ChatlioWidget
                        user={user}
                        organization={organization}
                        widgetid={chatlioWidgetId}
                      />
                    </li>
                  ) : null}
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
                      Icon={({ className, ...props }) => (
                        <Icon
                          icon="arrow-right"
                          className={clsx(
                            'transition-transform group-aria-expanded/nav:rotate-180',
                            className,
                          )}
                          {...props}
                        />
                      )}
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

export function ErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation(handle.i18n);

  // Handle Marble Admins, do not capture error in Sentry
  if (isRouteErrorResponse(error) && error.status === CONFLICT) {
    return (
      <div className="bg-purple-05 flex size-full items-center justify-center">
        <div className="bg-grey-00 flex max-w-md flex-col items-center gap-4 rounded-2xl p-10 text-center shadow-md">
          <h1 className="text-l text-purple-110 font-semibold">
            {t('common:error_boundary.marble_admin.title')}
          </h1>
          <p className="text-s mb-6">
            {t('common:error_boundary.marble_admin.subtitle')}
          </p>
          <div className="mb-1">
            <Form action={getRoute('/ressources/auth/logout')} method="POST">
              <Button
                type="submit"
                onClick={() => {
                  void segment.reset();
                }}
              >
                <Icon icon="logout" className="size-5" />
                {t('common:auth.logout')}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }

  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
