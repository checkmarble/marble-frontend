import { CollapsiblePaper, Page } from '@app-builder/components';
import { isAdmin } from '@app-builder/models';
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

  const [org, { user }] = await Promise.all([
    organization.getCurrentOrganization(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  return json({
    organization: org,
    user,
  });
}

export default function Users() {
  const { t } = useTranslation(['settings']);
  const { organization, user } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Content className="max-w-screen-xl">
        <CollapsiblePaper.Container>
          <CollapsiblePaper.Title>
            <span className="flex-1">{t('settings:scenenario_execution')}</span>
          </CollapsiblePaper.Title>
          <CollapsiblePaper.Content>
            {isAdmin(user) ? (
              <EditOrgDefaultTimezone
                organizationId={organization.id}
                currentTimezone={organization.defaultScenarioTimezone}
              />
            ) : (
              <div className="flex flex-row items-center justify-between">
                <p className="font-semibold first-letter:capitalize">
                  {t('settings:scenario_default_timezone.label')}
                </p>
                <p>{organization.defaultScenarioTimezone}</p>
              </div>
            )}
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
