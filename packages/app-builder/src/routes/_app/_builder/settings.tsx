import { Page } from '@app-builder/components';
import { type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { pageLayoutGutter } from '@app-builder/components/Page/page-layout';
import { SettingsNavigationTabs } from '@app-builder/components/Settings/Navigation/Tabs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models/user';
import { roleManagerOptionalList } from '@app-builder/services/roles-access';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { createFileRoute, Link, Outlet, redirect, useMatches } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { z } from 'zod/v4';

const guardSettingsPath = createServerFn()
  .middleware([authMiddleware])
  .validator(z.string())
  .handler(async ({ context, data }) => {
    if (
      isAnalyst(context.authInfo.user) &&
      data !== '/settings/roles' &&
      data !== '/settings' &&
      data !== '/settings/'
    ) {
      throw redirect({ to: '/cases' });
    }
  });

const settingsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function settingsLoader({ context }) {
    const { user, entitlements, inbox } = context.authInfo;
    const appConfig = context.appConfig;

    if (isAnalyst(user) && !user.permissions.canManageRoles) {
      throw redirect({ to: '/cases' });
    }

    const inboxes = await roleManagerOptionalList(inbox.listInboxes(), user.permissions.canManageRoles);
    const sections = getSettingsAccess(user, appConfig, inboxes);
    if (appConfig.isManagedMarble) sections.screening_providers.settings = []; // not in SaaS

    return { sections, entitlements };
  });

export const Route = createFileRoute('/_app/_builder/settings')({
  beforeLoad: ({ location }) => guardSettingsPath({ data: location.pathname }),
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
