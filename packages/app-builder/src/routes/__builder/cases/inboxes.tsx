import { Page, usePermissionsContext } from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { CreateInbox } from '@app-builder/routes/ressources/cases/create-inbox';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { CaseManager, Inbox } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'cases', ...casesI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const { inboxes } = await apiClient.listInboxes();

  return json({ inboxes });
}

export default function Cases() {
  const { t } = useTranslation(handle.i18n);
  const { inboxes } = useLoaderData<typeof loader>();
  const { canEditInboxes } = usePermissionsContext();

  return (
    <Page.Container>
      <Page.Header>
        <CaseManager className="mr-2" height="24px" width="24px" />
        {t('navigation:caseManager')}
      </Page.Header>
      <div className="flex h-full flex-row">
        <div className="border-r-grey-10 flex h-full w-full max-w-[300px] flex-col border-r p-4">
          <div className="flex flex-row items-center gap-2 pb-4">
            <Inbox />
            <p className="font-bold">{t('cases:case.inboxes')}</p>
          </div>
          <div className="flex flex-col gap-1 pb-6">
            {inboxes.map((inbox) => (
              <NavLink
                key={inbox.id}
                className={({ isActive }) =>
                  clsx(
                    'text-s cursor-pointer rounded p-2 font-medium first-letter:capitalize',
                    isActive
                      ? 'bg-purple-10 text-purple-100'
                      : 'bg-grey-00 text-grey-100 hover:bg-purple-10 hover:text-purple-100',
                  )
                }
                to={getRoute('/cases/inboxes/:inboxId', {
                  inboxId: fromUUID(inbox.id),
                })}
              >
                {inbox.name}
              </NavLink>
            ))}
          </div>
          {canEditInboxes ? <CreateInbox /> : null}
        </div>
        <Outlet />
      </div>
    </Page.Container>
  );
}
