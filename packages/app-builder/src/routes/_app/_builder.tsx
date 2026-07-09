import { navigationI18n, SidebarLink } from '@app-builder/components';
import { HeaderLogo } from '@app-builder/components/HeaderLogo';
import { LeftSidebar } from '@app-builder/components/Layout/LeftSidebar';
import { Nudge } from '@app-builder/components/Nudge';
import { UnavailableBanner } from '@app-builder/components/Settings/UnavailableBanner';
import { VersionUpdateModalContainer } from '@app-builder/components/VersionUpdate';
import { useRefreshToken } from '@app-builder/hooks/useRefreshToken';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
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
import { ClientOnly, createFileRoute, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type Namespace } from 'i18next';
import { type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

const appBuilderLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function appBuilderLayout({ context }) {
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
        userScoring: isAnalyst(user) ? ('restricted' as const) : entitlements.userScoring,
      },
      authProvider: context.appConfig.auth.provider,
      sentryReplayEnabled: organizationDetail.sentryReplayEnabled,
    };
  });

export const Route = createFileRoute('/_app/_builder')({
  loader: () => appBuilderLayoutLoader(),
  component: Builder,
});

const i18n: Namespace = ['common', ...navigationI18n];

const TokenRefresher = () => {
  useRefreshToken();
  return null;
};

const SIDEBAR_NUDGE_CLASS = cn(
  'absolute top-sm right-sm translate-x-[50%] -translate-y-[50%] rounded-full size-2.5',
  'group-hover/sidebar:static group-hover/sidebar:translate-x-0 group-hover/sidebar:translate-y-0',
  'group-hover/sidebar:rounded-sm group-hover/sidebar:size-6',
  'transition-all delay-300 group-hover/sidebar:delay-0 motion-reduce:delay-0 motion-reduce:duration-0',
);
const SIDEBAR_NUDGE_ICON_CLASS = 'size-2.5 group-hover/sidebar:size-3';

function SidebarNudge(props: Omit<ComponentProps<typeof Nudge>, 'className' | 'iconClass'>) {
  return <Nudge {...props} className={SIDEBAR_NUDGE_CLASS} iconClass={SIDEBAR_NUDGE_ICON_CLASS} />;
}

function Builder() {
  const { user, orgUsers, organization, orgTags, orgObjectTags, featuresAccess, authProvider, sentryReplayEnabled } =
    Route.useLoaderData();
  useSegmentIdentification(user);
  useSentryIdentification(user);
  useSentryReplay(sentryReplayEnabled);
  const { t } = useTranslation(i18n);

  return (
    <>
      <ClientOnly>{authProvider === 'firebase' ? <TokenRefresher /> : null}</ClientOnly>
      <ClientOnly>
        <VersionUpdateModalContainer />
      </ClientOnly>
      <OrganizationDetailsContextProvider org={organization} currentUser={user}>
        <OrganizationUsersContextProvider orgUsers={orgUsers}>
          <OrganizationTagsContextProvider orgTags={orgTags}>
            <OrganizationObjectTagsContextProvider tags={orgObjectTags}>
              <div className="flex min-h-screen flex-col">
                {/* <DatasetFreshnessBanner /> */}
                <div className="relative flex min-h-0 flex-1">
                  <LeftSidebar>
                    <div className="h-24 px-xs pt-md">
                      <HeaderLogo />
                    </div>
                    <nav className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-sm">
                      <ul className="flex flex-col gap-sm">
                        {/* Detection - flat link (tabs are inside the page) */}
                        {!isAnalyst(user) && (
                          <li>
                            <SidebarLink
                              labelTKey="navigation:detection"
                              to="/detection"
                              Icon={(props) => <Icon icon="scenarios" {...props} />}
                            />
                          </li>
                        )}
                        {/* User Scoring */}
                        {!isAnalyst(user) && (
                          <li>
                            {match(featuresAccess.userScoring)
                              .with(P.union('allowed', 'test'), () => {
                                return (
                                  <SidebarLink
                                    labelTKey="navigation:user_scoring"
                                    to="/user-scoring"
                                    Icon={(props) => <Icon icon="123" {...props} />}
                                  />
                                );
                              })
                              .otherwise((value) => {
                                return (
                                  <div className="text-grey-disabled relative flex gap-sm p-sm">
                                    <Icon icon="123" className="size-6 shrink-0" />
                                    <span className="text-s line-clamp-1 text-start font-medium opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-300 group-hover/sidebar:delay-0">
                                      {t('navigation:user_scoring')}
                                    </span>
                                    <SidebarNudge kind={value} content={t('navigation:user_scoring.nudge')} />
                                  </div>
                                );
                              })}
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
                                    to="/continuous-screening"
                                    Icon={(props) => <Icon icon="scan-eye" {...props} />}
                                  />
                                );
                              })
                              .otherwise((value) => {
                                return (
                                  <div className="text-grey-disabled relative flex gap-sm p-sm">
                                    <Icon icon="scan-eye" className="size-6 shrink-0" />
                                    <span className="text-s line-clamp-1 text-start font-medium opacity-0 transition-opacity group-hover/sidebar:opacity-100 delay-300 group-hover/sidebar:delay-0">
                                      {t('navigation:continuous_screening')}
                                    </span>
                                    <SidebarNudge kind={value} content={t('navigation:continuous_screening.nudge')} />
                                  </div>
                                );
                              })}
                          </li>
                        )}
                        {/* Investigations (Cases) */}
                        <li>
                          <SidebarLink
                            labelTKey="navigation:case_manager"
                            to="/cases"
                            Icon={(props) => <Icon icon="case-manager" {...props} />}
                          />
                        </li>
                        {/* Global Search (Screening Search) */}
                        {featuresAccess.isScreeningSearchAvailable ? (
                          <li>
                            <SidebarLink
                              labelTKey="navigation:screening_search"
                              to="/screening-search"
                              Icon={(props) => <Icon icon="search" {...props} />}
                            />
                          </li>
                        ) : null}
                        {/* Client detail */}
                        <li>
                          <SidebarLink
                            labelTKey="navigation:client_detail"
                            to="/client-detail"
                            Icon={(props) => <Icon icon="users" {...props} />}
                          />
                        </li>
                      </ul>
                    </nav>
                    {/* Secondary Navigation - Bottom */}
                    <nav className="p-sm pb-md">
                      <ul className="flex flex-col gap-sm">
                        {/* Your Data */}
                        {!isAnalyst(user) && (
                          <li>
                            <SidebarLink
                              labelTKey="navigation:data"
                              to="/data"
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
                            to="/account"
                            Icon={(props) => <Icon icon="user" {...props} />}
                          />
                        </li>
                      </ul>
                    </nav>
                  </LeftSidebar>

                  <Outlet />
                  {featuresAccess.isAutoAssignmentAvailable ? <UnavailableBanner /> : null}
                </div>
              </div>
            </OrganizationObjectTagsContextProvider>
          </OrganizationTagsContextProvider>
        </OrganizationUsersContextProvider>
      </OrganizationDetailsContextProvider>
    </>
  );
}
