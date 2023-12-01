import { Page, usePermissionsContext } from '@app-builder/components';
import { CreateInbox } from '@app-builder/routes/ressources/cases/create-inbox';
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

  const { inboxes } = await apiClient.listInboxes();

  if (inboxes.length > 10) {
    return redirect(
      getRoute('/cases/inbox/:inboxId', { inboxId: fromUUID(inboxes[0].id) })
    );
  }
  return null;
}

export default function Cases() {
  const { t } = useTranslation(['navigation']);
  const { canEditInboxes } = usePermissionsContext();

  return (
    <Page.Container>
      <Page.Header>
        <CaseManager className="mr-2" height="24px" width="24px" />
        {t('navigation:caseManager')}
      </Page.Header>
      <Page.Content>
        {!canEditInboxes ? (
          <div className="flex max-w-xl flex-col gap-2">
            <p>Create a first inbox to start using the case manager</p>
            <CreateInbox />
          </div>
        ) : (
          <p>Please contact your admin to get access to an inbox</p>
        )}
      </Page.Content>
    </Page.Container>
  );
}
