import { Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { casesI18n } from '@app-builder/components/Cases';
import { AvailabilityToggle } from '@app-builder/components/Settings/AvailabilityToggle';
import { CreateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/create';
import {
  canAccessInboxesSettings,
  isCreateInboxAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { Link, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { CtaClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MY_INBOX_ID } from './_index';

export const handle = {
  i18n: ['navigation', 'cases', 'settings', ...casesI18n] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          <Icon icon="case-manager" className="me-2 size-6" />
          {t('navigation:case_manager')}
        </BreadCrumbLink>
      );
    },
  ],
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxes = await inbox.listInboxes();

  return {
    inboxes,
    isCreateInboxAvailable: isCreateInboxAvailable(user),
    canAccessInboxSettings: canAccessInboxesSettings(user, inboxes),
  };
}

export default function Cases() {
  const { t } = useTranslation(handle.i18n);
  const { inboxes, isCreateInboxAvailable, canAccessInboxSettings } =
    useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        {canAccessInboxSettings ? (
          <Link
            to={getRoute('/settings/inboxes')}
            className={CtaClassName({ variant: 'secondary', size: 'small' })}
          >
            <Icon icon="settings" className="size-4" />
            {t('cases:case.inbox_settings_link')}
          </Link>
        ) : null}
      </Page.Header>
      <div className="flex h-full flex-row overflow-hidden">
        <div className="border-e-grey-90 bg-grey-100 flex h-full w-fit min-w-[200px] max-w-[300px] shrink-0 flex-col overflow-y-auto border-e p-4">
          <AvailabilityToggle />
          <NavLink
            className={({ isActive }) =>
              clsx(
                'border-grey-90 my-6 flex w-full cursor-pointer flex-row items-center justify-center gap-2 rounded border p-2',
                isActive
                  ? 'bg-purple-96 text-purple-65'
                  : 'text-grey-00 hover:bg-purple-96 hover:text-purple-65',
              )
            }
            to={`/cases/inboxes/${MY_INBOX_ID}`}
          >
            <Icon icon="person" className="size-5" />
            <p className="font-semibold">{t('cases:inbox.my-inbox.link')}</p>
          </NavLink>
          <div className="flex flex-row items-center gap-2">
            <Icon icon="inbox" className="size-5" />
            <p className="font-bold">{t('cases:case.inboxes')}</p>
          </div>
          <div className="mb-6 mt-4">
            <nav>
              <ul className="flex flex-col gap-1">
                {inboxes.map((inbox) => (
                  <li key={inbox.id}>
                    <NavLink
                      className={({ isActive }) =>
                        clsx(
                          'text-s flex w-full cursor-pointer flex-row items-center rounded p-2 font-medium',
                          isActive
                            ? 'bg-purple-96 text-purple-65'
                            : 'text-grey-00 hover:bg-purple-96 hover:text-purple-65',
                        )
                      }
                      to={getRoute('/cases/inboxes/:inboxId', {
                        inboxId: fromUUIDtoSUUID(inbox.id),
                      })}
                    >
                      {inbox.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {isCreateInboxAvailable && inboxes.length === 0 ? (
            <CreateInbox redirectRoutePath="/cases/inboxes/:inboxId" />
          ) : null}
        </div>
        <Outlet />
      </div>
    </Page.Main>
  );
}
