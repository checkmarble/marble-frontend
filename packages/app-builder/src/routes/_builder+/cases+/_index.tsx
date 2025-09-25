import { Page } from '@app-builder/components';
import { CreateInbox } from '@app-builder/components/Settings/Inboxes/CreateInbox';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { isCreateInboxAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { hasAtLeast } from 'remeda';
import { Icon } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxes = await inbox.listInboxes();

  if (hasAtLeast(inboxes, 1)) {
    return redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: MY_INBOX_ID }));
  }

  return {
    isCreateInboxAvailable: isCreateInboxAvailable(user),
  };
}

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
