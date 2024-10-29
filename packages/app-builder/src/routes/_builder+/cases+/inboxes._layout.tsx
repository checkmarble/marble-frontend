import { Page } from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { CreateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/create';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'cases', 'settings', ...casesI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxes = await inbox.listInboxes();

  return json({
    inboxes,
    isCreateInboxAvailable: featureAccessService.isCreateInboxAvailable(user),
  });
}

export default function Cases() {
  const { t } = useTranslation(handle.i18n);
  const { inboxes, isCreateInboxAvailable } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header>
        <Icon icon="case-manager" className="mr-2 size-6" />
        {t('navigation:caseManager')}
      </Page.Header>
      <div className="flex h-full flex-row overflow-hidden">
        <div className="border-r-grey-10 bg-grey-00 flex h-full w-fit min-w-[200px] max-w-[300px] shrink-0 flex-col overflow-y-auto border-r p-4">
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
                            ? 'bg-purple-10 text-purple-100'
                            : 'text-grey-100 hover:bg-purple-10 hover:text-purple-100',
                        )
                      }
                      to={getRoute('/cases/inboxes/:inboxId', {
                        inboxId: fromUUID(inbox.id),
                      })}
                    >
                      {inbox.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {isCreateInboxAvailable ? (
            <CreateInbox redirectRoutePath="/cases/inboxes/:inboxId" />
          ) : null}
        </div>
        <Outlet />
      </div>
    </Page.Main>
  );
}
