import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { LanguagePicker } from '@app-builder/components/LanguagePicker';
import { UserAvailabilityStatus } from '@app-builder/components/Settings/UserAvailabilityStatus';
import { useTheme } from '@app-builder/contexts/ThemeContext';
import { isAutoAssignmentAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { segment } from '@app-builder/services/segment';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Form, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'account', 'common'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/account')} isLast={isLast}>
          <Icon icon="user" className="me-2 size-6" />
          {t('navigation:my_account')}
        </BreadCrumbLink>
      );
    },
  ],
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, entitlements } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  return {
    user,
    isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
  };
}

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'text-s flex w-full cursor-pointer flex-row rounded-sm p-2 font-medium first-letter:capitalize',
    isActive
      ? 'bg-purple-background text-purple-primary dark:bg-grey-background-light dark:text-purple-hover'
      : 'text-grey-primary hover:bg-purple-background hover:text-purple-primary dark:text-grey-primary dark:hover:bg-grey-background-light dark:hover:text-purple-hover',
  );

export default function AccountLayout() {
  const { t } = useTranslation(handle.i18n);
  const { isAutoAssignmentAvailable: autoAssignAvailable } = useLoaderData<typeof loader>();
  const { theme, toggleTheme } = useTheme();

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <div className="flex size-full flex-row overflow-hidden">
        <div className="border-e-grey-border bg-surface-card flex h-full w-fit min-w-[200px] flex-col overflow-y-auto border-e p-4">
          <div className="flex flex-col gap-1">
            {/* Account Info */}
            <NavLink className={navLinkClassName} to={getRoute('/account/profile')}>
              {t('account:profile')}
            </NavLink>

            {/* Language */}
            <div className="p-2">
              <p className="text-s text-grey-primary mb-2 font-medium">{t('account:language')}</p>
              <LanguagePicker />
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between p-2">
              <span className="text-s text-grey-primary font-medium">{t('account:dark_mode')}</span>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>

            {/* User Availability (if enabled) */}
            {autoAssignAvailable ? (
              <div className="p-2">
                <UserAvailabilityStatus isAutoAssignmentAvailable={autoAssignAvailable} />
              </div>
            ) : null}

            {/* Documentation Link */}
            <a
              href="https://docs.checkmarble.com"
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(navLinkClassName({ isActive: false }), 'flex items-center gap-2')}
            >
              <Icon icon="openinnew" className="size-4" />
              {t('account:documentation')}
            </a>

            {/* Logout */}
            <Form action={getRoute('/ressources/auth/logout')} method="POST" className="mt-4">
              <Button
                variant="secondary"
                type="submit"
                className="w-full"
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
        <Outlet />
      </div>
    </Page.Main>
  );
}
