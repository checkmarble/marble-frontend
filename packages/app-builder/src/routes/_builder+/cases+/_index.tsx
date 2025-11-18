import { Page } from '@app-builder/components';
import { CreateInbox } from '@app-builder/components/Settings/Inboxes/CreateInbox';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const loader = createServerFn([authMiddleware], async function casesIndexLoader({ context }) {
  const { user } = context.authInfo;

  // const inboxes = await inbox.listInboxes();
  if (!isAdmin(user)) {
    throw redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }));
  }

  return redirect(getRoute('/cases/overview'));

  // if (hasAtLeast(inboxes, 1)) {
  //   return redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }));
  // }

  // return {
  //   isCreateInboxAvailable: isCreateInboxAvailable(user),
  // };
});

export default function Cases() {
  const { t } = useTranslation(['navigation', 'cases']);
  const { isCreateInboxAvailable } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header>
        <Icon icon="case-manager" className="me-2 size-6" />
        {t('navigation:case_manager')}
      </Page.Header>
      <Page.Container>
        <Page.Content>
          {isCreateInboxAvailable ? (
            <div className="flex max-w-xl flex-col gap-4">
              <p>{t('cases:inbox.need_first_inbox')}</p>
              <CreateInbox redirectRoutePath="/cases/inboxes/:inboxId" />
            </div>
          ) : (
            <p>{t('cases:inbox.need_inbox_contact_admin')}</p>
          )}
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
