import {
  navigationI18n,
  SidebarButton,
  SidebarLink,
} from '@app-builder/components';
import {
  HelpCenter,
  useMarbleCoreResources,
} from '@app-builder/components/HelpCenter';
import {
  LeftSidebar,
  ToggleSidebar,
} from '@app-builder/components/Layout/LeftSidebar';
import { UserInfo } from '@app-builder/components/UserInfo';
import { isMarbleCoreUser } from '@app-builder/models';
import { useRefreshToken } from '@app-builder/routes/ressources+/auth+/refresh';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { serverServices } from '@app-builder/services/init.server';
import { OrganizationDetailsContextProvider } from '@app-builder/services/organization/organization-detail';
import { OrganizationTagsContextProvider } from '@app-builder/services/organization/organization-tags';
import { OrganizationUsersContextProvider } from '@app-builder/services/organization/organization-users';
import { useSegmentIdentification } from '@app-builder/services/segment';
import { forbidden } from '@app-builder/utils/http/http-responses';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Icon } from 'ui-icons';

import { getSettings } from './settings+/_layout';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { user, organization, entitlements } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  if (!isMarbleCoreUser(user)) {
    throw forbidden('Only Marble Core users can access this app.');
  }

  const [organizationDetail, orgUsers, orgTags, settings] = await Promise.all([
    organization.getCurrentOrganization(),
    organization.listUsers(),
    organization.listTags(),
    getSettings(user, entitlements),
  ]);

  const firstSettings = settings[0];

  return json({
    user,
    orgUsers,
    organization: organizationDetail,
    orgTags,
    featuresAccess: {
      isAnalyticsAvailable: isAnalyticsAvailable(user, entitlements),
      settings:
        firstSettings !== undefined
          ? {
              isAvailable: true as const,
              to: firstSettings.to,
            }
          : {
              isAvailable: false as const,
            },
    },
  });
}

export const handle = {
  i18n: ['common', ...navigationI18n] satisfies Namespace,
};

export default function Builder() {
  const { user, orgUsers, organization, orgTags, featuresAccess } =
    useLoaderData<typeof loader>();
  useSegmentIdentification(user);

  // Refresh is done in the JSX because it needs to be done in the browser
  // This is only added here to prevent "auto sign-in" on /sign-in pages... (/logout do not trigger logout from Firebase)
  useRefreshToken();

  const marbleCoreResources = useMarbleCoreResources();

  return (
    <OrganizationDetailsContextProvider org={organization} currentUser={user}>
      <OrganizationUsersContextProvider orgUsers={orgUsers}>
        <OrganizationTagsContextProvider orgTags={orgTags}>
          <div className="flex h-full flex-1 flex-row overflow-hidden">
            <LeftSidebar>
              <div className="h-24 px-2 pt-3">
                <UserInfo
                  email={user.actorIdentity.email}
                  firstName={user.actorIdentity.firstName}
                  lastName={user.actorIdentity.lastName}
                  role={user.role}
                  orgOrPartnerName={organization.name}
                />
              </div>
              <nav className="flex flex-1 flex-col overflow-y-auto p-2">
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
                      labelTKey="navigation:case_manager"
                      to={getRoute('/cases/')}
                      Icon={(props) => <Icon icon="case-manager" {...props} />}
                    />
                  </li>
                  {featuresAccess.isAnalyticsAvailable ? (
                    <li>
                      <SidebarLink
                        labelTKey="navigation:analytics"
                        to={getRoute('/analytics')}
                        Icon={(props) => <Icon icon="analytics" {...props} />}
                      />
                    </li>
                  ) : null}
                </ul>
              </nav>
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
                  {featuresAccess.settings.isAvailable ? (
                    <li key="navigation:settings">
                      <SidebarLink
                        labelTKey="navigation:settings"
                        to={featuresAccess.settings.to}
                        Icon={(props) => <Icon icon="settings" {...props} />}
                      />
                    </li>
                  ) : null}
                  <li>
                    <HelpCenter
                      defaultTab={marbleCoreResources.defaultTab}
                      resources={marbleCoreResources.resources}
                      MenuButton={
                        <SidebarButton
                          labelTKey="navigation:helpCenter"
                          Icon={(props) => (
                            <Icon icon="helpcenter" {...props} />
                          )}
                        />
                      }
                    />
                  </li>
                  <li>
                    <ToggleSidebar />
                  </li>
                </ul>
              </nav>
            </LeftSidebar>

            <Outlet />
          </div>
        </OrganizationTagsContextProvider>
      </OrganizationUsersContextProvider>
    </OrganizationDetailsContextProvider>
  );
}
