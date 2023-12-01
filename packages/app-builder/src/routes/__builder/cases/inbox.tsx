import { Page, usePermissionsContext } from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { CreateInbox } from '@app-builder/routes/ressources/cases/create-inbox';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useState } from 'react';
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
  const [selectedInbox, setSelectedInbox] = useState<string>(
    inboxes.length > 0 ? inboxes[0].id : ''
  );
  const { canEditInboxes } = usePermissionsContext();

  const navigate = useNavigate();

  return (
    <Page.Container>
      <Page.Header>
        <CaseManager className="mr-2" height="24px" width="24px" />
        {t('navigation:caseManager')}
      </Page.Header>
      <div className="flex h-full flex-row">
        <div className="border-r-grey-25 h-full min-w-[250px] max-w-[350px] border-r p-4">
          <div className="flex flex-row items-center gap-2 pb-4">
            <Inbox />
            <p className="font-bold">{t('cases:case.inboxes')}</p>
          </div>
          <div className="flex flex-col space-y-1 pb-6">
            {inboxes.map((inbox) => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <p
                className={clsx(
                  'hover:bg-purple-05 cursor-pointer gap-2 rounded-md p-2 text-[14px] first-letter:capitalize',
                  selectedInbox === inbox.id
                    ? 'bg-purple-05 text-purple-100'
                    : 'bg-grey-00 text-grey-100'
                )}
                onClick={() => {
                  setSelectedInbox(inbox.id);
                  console.log(selectedInbox);
                  navigate(
                    getRoute('/cases/inbox/:inboxId', {
                      inboxId: fromUUID(inbox.id),
                    })
                  );
                }}
                key={inbox.id}
              >
                {inbox.name}
              </p>
            ))}
          </div>
          {canEditInboxes && <CreateInbox />}
        </div>
        <Outlet />
      </div>
    </Page.Container>
  );
}
