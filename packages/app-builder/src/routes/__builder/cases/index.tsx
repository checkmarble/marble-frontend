import { Page, usePermissionsContext } from '@app-builder/components';
import { CreateInbox } from '@app-builder/routes/ressources/settings/inboxes/create';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { type LoaderArgs, redirect } from '@remix-run/node';
import CaseManager from 'packages/ui-icons/src/CaseManager';
import { useTranslation } from 'react-i18next';

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const { inboxes } = await apiClient.listInboxes({ withCaseCount: false });

  if (inboxes.length > 0) {
    return redirect(
      getRoute('/cases/inboxes/:inboxId', { inboxId: fromUUID(inboxes[0].id) }),
    );
  }
  return null;
}

export default function Cases() {
  const { t } = useTranslation(['navigation', 'cases']);
  const { canEditInboxes } = usePermissionsContext();

  return (
    <Page.Container>
      <Page.Header>
        <CaseManager className="mr-2" height="24px" width="24px" />
        {t('navigation:caseManager')}
      </Page.Header>
      <Page.Content>
        {canEditInboxes ? (
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
