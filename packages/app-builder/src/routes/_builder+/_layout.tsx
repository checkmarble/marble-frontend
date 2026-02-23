import { navigationI18n, SidebarLink } from '@app-builder/components';
import { LeftSidebar, LeftSidebarSharpFactory, ToggleSidebar } from '@app-builder/components/Layout/LeftSidebar';
import { Nudge } from '@app-builder/components/Nudge';
import { DatasetFreshnessBanner } from '@app-builder/components/Screenings/DatasetFresshnessBanner';
import { UnavailableBanner } from '@app-builder/components/Settings/UnavailableBanner';
import { UserInfo } from '@app-builder/components/UserInfo';
import { VersionUpdateModalContainer } from '@app-builder/components/VersionUpdate';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { useRefreshToken } from '@app-builder/routes/ressources+/auth+/refresh';
import {
  isAnalyticsAvailable,
  isAutoAssignmentAvailable,
  isScreeningSearchAvailable,
} from '@app-builder/services/feature-access';
import { OrganizationDetailsContextProvider } from '@app-builder/services/organization/organization-detail';
import { OrganizationObjectTagsContextProvider } from '@app-builder/services/organization/organization-object-tags';
import { OrganizationTagsContextProvider } from '@app-builder/services/organization/organization-tags';
import { OrganizationUsersContextProvider } from '@app-builder/services/organization/organization-users';
import { useSegmentIdentification } from '@app-builder/services/segment';
import { useSentryIdentification, useSentryReplay } from '@app-builder/services/sentry';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { match, P } from 'ts-pattern';
import { Icon } from 'ui-icons';

export const loader = createServerFn([authMiddleware], async function appBuilderLayout({ request, context }) {
  const { user, inbox, organization, entitlements } = context.authInfo;
  const [organizationDetail, orgUsers, orgTags, orgObjectTags, inboxes] = await Promise.all([
    organization.getCurrentOrganization(),
    organization.listUsers(),
    organization.listTags(),
    organization.listTags({ target: 'object' }),
    inbox.listInboxes(),
  ]);

  const settingsSections = getSettingsAccess(user, context.appConfig, inboxes);
  const firstSetting = Object.values(settingsSections).find((s) => s.settings.length > 0)?.settings[0];

  return {
    user,
    orgUsers,
    organization: organizationDetail,
    orgTags,
    orgObjectTags,
    featuresAccess: {
      isAnalyticsAvailable: isAnalyticsAvailable(user, entitlements),
      analytics: entitlements.analytics,
      settings:
        !isAnalyst(user) && firstSetting !== undefined
          ? { isAvailable: true as const, to: firstSetting.to }
          : { isAvailable: false as const },
      isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
      continuousScreening: entitlements.continuousScreening,
      isScreeningSearchAvailable: isScreeningSearchAvailable(entitlements),
    },
    authProvider: context.appConfig.auth.provider,
    isMenuExpanded: getPreferencesCookie(request, 'menuExpd'),
    sentryReplayEnabled: organizationDetail.sentryReplayEnabled,
  };
});

export const handle = {
  i18n: ['common', ...navigationI18n] satisfies Namespace,
};

const TokenRefresher = () => {
  useRefreshToken();
  return null;
};

export default function Builder() {
  const {
    user,
    orgUsers,
    organization,
    orgTags,
    orgObjectTags,
    featuresAccess,
    isMenuExpanded,
    authProvider,
    sentryReplayEnabled,
  } = useLoaderData<typeof loader>();
  useSegmentIdentification(user);
  useSentryIdentification(user);
  useSentryReplay(sentryReplayEnabled);
  const { t } = useTranslation(handle.i18n);
  const leftSidebarSharp = LeftSidebarSharpFactory.createSharp(isMenuExpanded);

  return (
    <>
      <ClientOnly>{() => (authProvider === 'firebase' ? <TokenRefresher /> : null)}</ClientOnly>
      <ClientOnly>{() => <VersionUpdateModalContainer />}</ClientOnly>
      <OrganizationDetailsContextProvider org={organization} currentUser={user}>
        <OrganizationUsersContextProvider orgUsers={orgUsers}>
          <OrganizationTagsContextProvider orgTags={orgTags}>
            <OrganizationObjectTagsContextProvider tags={orgObjectTags}>
              <div className="flex h-screen flex-1 flex-col">
                <DatasetFreshnessBanner />
                <div className="flex flex-1 flex-row overflow-hidden">
                  <LeftSidebarSharpFactory.Provider value={leftSidebarSharp}>
                    <LeftSidebar>
                      <div className="h-24 px-2 pt-3">
                        <UserInfo isAutoAssignmentAvailable={featuresAccess.isAutoAssignmentAvailable} />
                      </div>
                      <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-2">
                        <ul className="flex flex-col gap-2">
                          {/* Detection - flat link (tabs are inside the page) */}
                          {!isAnalyst(user) && (
                            <li>
                              <SidebarLink
                                labelTKey="navigation:detection"
                                to={getRoute('/detection')}
                                Icon={(props) => <Icon icon="scenarios" {...props} />}
                              />
                            </li>
                          )}
                          {/* Monitoring (Continuous Screening) */}
                          {!isAnalyst(user) && (
                            <li>
                              {match(featuresAccess.continuousScreening)
                                .with(P.union('allowed', 'test'), () => {
                                  return (
                                    <SidebarLink
                                      labelTKey="navigation:continuous_screening"
                                      to={getRoute('/continuous-screening')}
                                      Icon={(props) => <Icon icon="scan-eye" {...props} />}
                                    />
                                  );
                                })
                                .otherwise((value) => {
                                  return (
                                    <div className="text-grey-disabled relative flex gap-2 p-2">
                                      <Icon icon="scan-eye" className="size-6 shrink-0" />
                                      <span className="text-s line-clamp-1 text-start font-medium opacity-0 transition-opacity group-aria-expanded/nav:opacity-100">
                                        {t('navigation:continuous_screening')}
                                      </span>
                                      <Nudge
                                        collapsed={!leftSidebarSharp.value.expanded}
                                        kind={value}
                                        className="size-6"
                                        content={t('navigation:continuous_screening.nudge')}
                                      />
                                    </div>
                                  );
                                })}
                            </li>
                          )}
                          {/* Investigations (Cases) */}
                          <li>
                            <SidebarLink
                              labelTKey="navigation:case_manager"
                              to={getRoute('/cases')}
                              Icon={(props) => <Icon icon="case-manager" {...props} />}
                            />
                          </li>
                          {/* Global Search (Screening Search) */}
                          {featuresAccess.isScreeningSearchAvailable ? (
                            <li>
                              <SidebarLink
                                labelTKey="navigation:screening_search"
                                to={getRoute('/screening-search')}
                                Icon={(props) => <Icon icon="search" {...props} />}
                              />
                            </li>
                          ) : null}
                        </ul>
                      </nav>
                      {/* Secondary Navigation - Bottom */}
                      <nav className="p-2 pb-4">
                        <ul className="flex flex-col gap-2">
                          {/* Your Data */}
                          {!isAnalyst(user) && (
                            <li>
                              <SidebarLink
                                labelTKey="navigation:data"
                                to={getRoute('/data')}
                                Icon={(props) => <Icon icon="harddrive" {...props} />}
                              />
                            </li>
                          )}
                          {/* Settings */}
                          {featuresAccess.settings.isAvailable ? (
                            <li>
                              <SidebarLink
                                labelTKey="navigation:settings"
                                to={featuresAccess.settings.to}
                                Icon={(props) => <Icon icon="settings" {...props} />}
                              />
                            </li>
                          ) : null}
                          {/* My Account */}
                          <li>
                            <SidebarLink
                              labelTKey="navigation:my_account"
                              to={getRoute('/account')}
                              Icon={(props) => <Icon icon="user" {...props} />}
                            />
                          </li>
                        </ul>
                      </nav>
                      <div className="p-2 pb-4">
                        <ToggleSidebar />
                      </div>
                    </LeftSidebar>

                    <Outlet />
                    {featuresAccess.isAutoAssignmentAvailable ? <UnavailableBanner /> : null}
                  </LeftSidebarSharpFactory.Provider>
                </div>
              </div>
            </OrganizationObjectTagsContextProvider>
          </OrganizationTagsContextProvider>
        </OrganizationUsersContextProvider>
      </OrganizationDetailsContextProvider>
    </>
  );
}
