import { Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'settings'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  return null;
}

export default function Settings() {
  const { t } = useTranslation(handle.i18n);

  return (
    <Page.Container>
      <Page.Header>
        <Icon icon="settings" className="mr-2 size-6" />
        {t('navigation:settings')}
      </Page.Header>
      <div className="flex size-full flex-row overflow-hidden">
        <div className="border-r-grey-10 bg-grey-00 flex h-full w-fit min-w-[200px] flex-col border-r p-4">
          <SettingsNavSection icon="users" title={t('settings:users')}>
            <ul className="flex flex-col gap-1 pb-6">
              <li>
                <SettingsNavLink
                  text={t('settings:users')}
                  to={getRoute('/settings/users')}
                />
              </li>
              <li>
                <SettingsNavLink
                  text={t('settings:api_keys')}
                  to={getRoute('/settings/api-keys')}
                />
              </li>
            </ul>
          </SettingsNavSection>
          <SettingsNavSection
            icon="case-manager"
            title={t('settings:case_manager')}
          >
            <ul className="flex flex-col gap-1 pb-6">
              <li>
                <SettingsNavLink
                  text={t('settings:inboxes')}
                  to={getRoute('/settings/inboxes/')}
                />
              </li>
              <li>
                <SettingsNavLink
                  text={t('settings:tags')}
                  to={getRoute('/settings/tags')}
                />
              </li>
            </ul>
          </SettingsNavSection>
          <SettingsNavSection icon="world" title={t('settings:api')}>
            <ul className="flex flex-col gap-1 pb-6">
              <li>
                <SettingsNavLink
                  text={t('settings:webhooks')}
                  to={getRoute('/settings/webhooks')}
                />
              </li>
            </ul>
          </SettingsNavSection>
        </div>
        <Outlet />
      </div>
    </Page.Container>
  );
}

function SettingsNavSection({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <Icon icon={icon} className="size-5" />
        <p className="font-bold">{title}</p>
      </div>
      {children}
    </nav>
  );
}

function SettingsNavLink({ text, to }: { text: string; to: string }) {
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-s flex w-full cursor-pointer flex-row rounded p-2 font-medium first-letter:capitalize',
          isActive
            ? 'bg-purple-10 text-purple-100'
            : 'bg-grey-00 text-grey-100 hover:bg-purple-10 hover:text-purple-100',
        )
      }
      to={to}
    >
      {text}
    </NavLink>
  );
}
