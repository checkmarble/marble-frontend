import { CollapsiblePaper, Page } from '@app-builder/components';
import { EditOrgDefaultTimezone } from '@app-builder/routes/ressources+/settings+/edit-org-default-timezone';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { organization } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const org = await organization.getCurrentOrganization();

  return json({
    organization: org,
  });
}

export default function Users() {
  const { t } = useTranslation(['settings']);
  const { organization } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:scenenario_execution')}</span>
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            <EditOrgDefaultTimezone
              organizationId={organization.id}
              currentTimezone={organization.defaultScenarioTimezone}
            />
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
