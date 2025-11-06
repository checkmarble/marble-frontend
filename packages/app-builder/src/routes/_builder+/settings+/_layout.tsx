import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { Nudge } from '@app-builder/components/Nudge';
import { isAccessible } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getSettingsAccess } from '@app-builder/services/settings-access';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, appConfigRepository } = initServerServices(request);
  const { user, entitlements, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const appConfig = await appConfigRepository.getAppConfig();
  const inboxes = await inbox.listInboxes();

  const sections = getSettingsAccess(user, appConfig, inboxes);

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
            {Object.entries(sections).map(([section, { icon, settings }]) => {
              if (settings.length === 0) return null;

              return (
                <nav key={section} className="flex flex-col gap-4">
                  <div className="flex flex-row items-center gap-2">
                    <Icon icon={icon} className="size-5" />
                    <p className="font-bold">{t(`settings:${section}` as any)}</p>
                  </div>
                  <ul className="flex flex-col gap-1 pb-6">
                    {settings.map((setting) =>
                      setting.title === 'webhooks' && !isAccessible(entitlements.webhooks) ? (
                        <span
                          key={setting.title}
                          className="text-s bg-grey-100 text-grey-80 inline-flex w-full gap-2 p-2 font-medium first-letter:capitalize"
                        >
                          {t(`settings:${setting.title}` as any)}
                          {entitlements.webhooks !== 'allowed' ? (
                            <Nudge content="" kind={entitlements.webhooks} className="size-5" />
                          ) : null}
                        </span>
                      ) : (
                        <NavLink
                          key={setting.title}
                          className={({ isActive }) =>
                            clsx(
                              'text-s flex w-full cursor-pointer flex-row rounded-sm p-2 font-medium first-letter:capitalize',
                              isActive
                                ? 'bg-purple-96 text-purple-65'
                                : 'bg-grey-100 text-grey-00 hover:bg-purple-96 hover:text-purple-65',
                            )
                          }
                          to={setting.to}
                        >
                          {t(`settings:${setting.title}` as any)}
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
