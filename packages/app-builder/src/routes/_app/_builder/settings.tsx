import { Page } from '@app-builder/components';
import { type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { pageLayoutGutter } from '@app-builder/components/Page/page-layout';
import { SettingsNavigationTabs } from '@app-builder/components/Settings/Navigation/Tabs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { createFileRoute, Link, Outlet, redirect, useMatches } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';

const settingsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function settingsLoader({ context }) {
    const { user, entitlements, inbox } = context.authInfo;
    const appConfig = context.appConfig;

    const inboxes = await inbox.listInboxes();
    const sections = getSettingsAccess(user, appConfig, inboxes);
    if (appConfig.isManagedMarble) sections.screening_providers.settings = []; // not in SaaS

    // No accessible settings section for this user → nothing to show.
    if (Object.values(sections).every((section) => section.settings.length === 0)) {
      throw redirect({ to: '/cases' });
    }

    return { sections, entitlements };
  });

export const Route = createFileRoute('/_app/_builder/settings')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['settings']);
        return (
          <Link
            to="/settings/api-keys"
            className={cn('text-s flex items-center font-bold transition-colors', {
              'text-grey-secondary hover:text-grey-primary': !isLast,
            })}
          >
            {t('settings:api')}
          </Link>
        );
      },
    ],
  },
  loader: () => settingsLoader(),
  component: Settings,
});

function Settings() {
  const { sections } = Route.useLoaderData();
  const matches = useMatches();
  const hideTabs = matches.some((m) => (m.staticData as { hideTabs?: boolean })?.hideTabs);

  return (
    <Page.Main>
      {hideTabs ? null : (
        <div className={cn(pageLayoutGutter.paddingX, pageLayoutGutter.paddingTop, 'pb-0')}>
          <SettingsNavigationTabs sections={sections} />
        </div>
      )}
      <Outlet />
    </Page.Main>
  );
}
