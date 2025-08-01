import { Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { Nudge } from '@app-builder/components/Nudge';
import { type CurrentUser, isAdmin } from '@app-builder/models';
import { type Inbox } from '@app-builder/models/inbox';
import {
  canAccessInboxesSettings,
  isAccessible,
  isReadApiKeyAvailable,
  isReadTagAvailable,
  isReadUserAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'settings'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/settings')} isLast={isLast}>
          <Icon icon="settings" className="me-2 size-6" />
          {t('navigation:settings')}
        </BreadCrumbLink>
      );
    },
  ],
};

export function getSettings(user: CurrentUser, inboxes: Inbox[]) {
  const settings = [];
  if (isReadUserAvailable(user)) {
    settings.push({
      section: 'users' as const,
      title: 'users' as const,
      to: getRoute('/settings/users'),
    });
  }
  if (isAdmin(user)) {
    settings.push({
      section: 'scenarios' as const,
      title: 'scenarios' as const,
      to: getRoute('/settings/scenarios'),
    });
  }
  if (canAccessInboxesSettings(user, inboxes)) {
    settings.push({
      section: 'case_manager' as const,
      title: 'inboxes' as const,
      to: getRoute('/settings/inboxes'),
    });
  }
  if (isReadTagAvailable(user)) {
    settings.push({
      section: 'case_manager' as const,
      title: 'tags' as const,
      to: getRoute('/settings/tags'),
    });
  }
  if (isReadApiKeyAvailable(user)) {
    settings.push({
      section: 'api' as const,
      title: 'api' as const,
      to: getRoute('/settings/api-keys'),
    });
  }
  if (user.permissions.canManageWebhooks) {
    settings.push({
      section: 'api' as const,
      title: 'webhooks' as const,
      to: getRoute('/settings/webhooks'),
    });
  }
  if (isAdmin(user)) {
    settings.push({
      section: 'case_manager' as const,
      title: 'data_display' as const,
      to: getRoute('/settings/data-display'),
    });
  }
  return settings;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, entitlements, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxes = await inbox.listInboxes();
  const settings = getSettings(user, inboxes);

  const sections = R.pipe(
    settings,
    R.groupBy((s) => s.section),
    R.entries(),
  );

  return { sections, entitlements };
}

export default function Settings() {
  const { t } = useTranslation(handle.i18n);
  const { sections, entitlements } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <div className="flex size-full flex-row overflow-hidden">
        <div className="border-e-grey-90 bg-grey-100 flex h-full w-fit min-w-[200px] flex-col overflow-y-auto border-e p-4">
          <div className="flex flex-col">
            {sections.map(([section, settings]) => {
              if (settings.length === 0) return null;

              const icon =
                section === 'users'
                  ? 'users'
                  : section === 'case_manager'
                    ? 'case-manager'
                    : 'world';

              return (
                <nav key={section} className="flex flex-col gap-4">
                  <div className="flex flex-row items-center gap-2">
                    <Icon icon={icon} className="size-5" />
                    <p className="font-bold">{t(`settings:${section}`)}</p>
                  </div>
                  <ul className="flex flex-col gap-1 pb-6">
                    {settings.map((setting) =>
                      setting.title === 'webhooks' && !isAccessible(entitlements.webhooks) ? (
                        <span
                          key={setting.title}
                          className="text-s bg-grey-100 text-grey-80 inline-flex w-full gap-2 p-2 font-medium first-letter:capitalize"
                        >
                          {t(`settings:${setting.title}`)}
                          {entitlements.webhooks !== 'allowed' ? (
                            <Nudge content="" kind="restricted" className="size-5" />
                          ) : null}
                        </span>
                      ) : (
                        <NavLink
                          key={setting.title}
                          className={({ isActive }) =>
                            clsx(
                              'text-s flex w-full cursor-pointer flex-row rounded p-2 font-medium first-letter:capitalize',
                              isActive
                                ? 'bg-purple-96 text-purple-65'
                                : 'bg-grey-100 text-grey-00 hover:bg-purple-96 hover:text-purple-65',
                            )
                          }
                          to={setting.to}
                        >
                          {t(`settings:${setting.title}`)}
                        </NavLink>
                      ),
                    )}
                  </ul>
                </nav>
              );
            })}
          </div>
        </div>
        <Outlet />
      </div>
    </Page.Main>
  );
}
