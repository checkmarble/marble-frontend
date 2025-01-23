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
  const { organization: organizationsRepository, user } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const organization = await organizationsRepository.getCurrentOrganization();

  return json({
    organization,
    user,
  });
}

export const BreadCrumb = () => {
  const { t } = useTranslation(['settings']);
  return <span>{t('settings:scenarios')}</span>;
};

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
                {organization.defaultScenarioTimezone ? (
                  <span>{organization.defaultScenarioTimezone}</span>
                ) : (
                  <span className="text-red-47">
                    {t('settings:scenario_default_timezone.not_set')}
                  </span>
                )}
              </div>
            )}
          </CollapsiblePaper.Content>
        </CollapsiblePaper.Container>
      </Page.Content>
    </Page.Container>
  );
}
