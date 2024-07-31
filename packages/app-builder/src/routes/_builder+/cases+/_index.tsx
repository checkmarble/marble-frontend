import { Page } from '@app-builder/components';
import { CreateInbox } from '@app-builder/routes/ressources+/settings+/inboxes+/create';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Icon } from 'ui-icons';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { user, inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const inboxes = await inbox.listInboxes();

  if (R.hasAtLeast(inboxes, 1)) {
    return redirect(
      getRoute('/cases/inboxes/:inboxId', { inboxId: fromUUID(inboxes[0].id) }),
    );
  }

  return json({
    isCreateInboxAvailable: featureAccessService.isCreateInboxAvailable(user),
  });
}

export default function Cases() {
  const { t } = useTranslation(['navigation', 'cases']);
  const { isCreateInboxAvailable } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <Icon icon="case-manager" className="mr-2 size-6" />
        {t('navigation:caseManager')}
      </Page.Header>
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
  );
}
