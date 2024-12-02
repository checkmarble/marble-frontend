import { Page } from '@app-builder/components';
import { type CurrentUser } from '@app-builder/models';
import { type FeatureAccessService } from '@app-builder/services/feature-access.server';
import { serverServices } from '@app-builder/services/init.server';
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
};

export async function getSettings(
  user: CurrentUser,
  featureAccessService: FeatureAccessService,
) {
  const settings = [];
  if (featureAccessService.isReadUserAvailable(user)) {
    settings.push({
      section: 'users' as const,
      title: 'users' as const,
      to: getRoute('/settings/users'),
    });
  }
  settings.push({
    section: 'scenarios' as const,
    title: 'scenarios' as const,
    to: getRoute('/settings/scenarios'),
  });
  if (featureAccessService.isReadAllInboxesAvailable(user)) {
    settings.push({
      section: 'case_manager' as const,
      title: 'inboxes' as const,
      to: getRoute('/settings/inboxes/'),
    });
  }
  if (featureAccessService.isReadTagAvailable(user)) {
    settings.push({
      section: 'case_manager' as const,
      title: 'tags' as const,
      to: getRoute('/settings/tags'),
    });
  }
  if (featureAccessService.isReadApiKeyAvailable(user)) {
    settings.push({
      section: 'api' as const,
      title: 'api' as const,
      to: getRoute('/settings/api-keys'),
    });
  }
  if (await featureAccessService.isReadWebhookAvailable(user)) {
    settings.push({
      section: 'api' as const,
      title: 'webhooks' as const,
      to: getRoute('/settings/webhooks'),
    });
  }
  return settings;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const settings = await getSettings(user, featureAccessService);

  const sections = R.pipe(
    settings,
    R.groupBy((s) => s.section),
    R.entries(),
  );

  return { sections };
}

export default function Settings() {
  const { t } = useTranslation(handle.i18n);
  const { sections } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header>
        <Icon icon="settings" className="mr-2 size-6" />
        {t('navigation:settings')}
      </Page.Header>
      <div className="flex size-full flex-row overflow-hidden">
        <div className="border-e-grey-10 bg-grey-00 flex h-full w-fit min-w-[200px] flex-col overflow-y-auto border-e p-4">
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
                    {settings.map((setting) => (
                      <NavLink
                        key={setting.title}
                        className={({ isActive }) =>
                          clsx(
                            'text-s flex w-full cursor-pointer flex-row rounded p-2 font-medium first-letter:capitalize',
                            isActive
                              ? 'bg-purple-10 text-purple-100'
                              : 'bg-grey-00 text-grey-100 hover:bg-purple-10 hover:text-purple-100',
                          )
                        }
                        to={setting.to}
                      >
                        {t(`settings:${setting.title}`)}
                      </NavLink>
                    ))}
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
