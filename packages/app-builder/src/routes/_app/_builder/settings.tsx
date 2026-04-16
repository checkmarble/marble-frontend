import { Page } from '@app-builder/components';
import { type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { SettingsNavigationTabs } from '@app-builder/components/Settings/Navigation/Tabs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models/user';
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

    if (isAnalyst(user)) {
      throw redirect({ to: '/cases' });
    }

    const inboxes = await inbox.listInboxes();
    const sections = getSettingsAccess(user, appConfig, inboxes);

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
        <div className="p-v2-lg pb-0">
          <SettingsNavigationTabs sections={sections} />
        </div>
      )}
      <Outlet />
    </Page.Main>
  );
}
