import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CreateScenario } from '@app-builder/routes/ressources+/scenarios+/create';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData, useRouteError } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['scenarios', 'navigation'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const scenarios = await scenario.listScenarios();

  return json({
    scenarios,
  });
}

export default function ScenariosPage() {
  const { t } = useTranslation(handle.i18n);
  const { scenarios } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Description>
          {t('scenarios:scenarios.description')}
        </Page.Description>
        <Page.Content className="max-w-3xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-end">
              <CreateScenario>
                <Button>
                  <Icon icon="plus" className="size-6" aria-hidden />
                  {t('scenarios:create_scenario.title')}
                </Button>
              </CreateScenario>
            </div>
            <div className="flex flex-col gap-2 lg:gap-4">
              {scenarios.length ? (
                scenarios.map((scenario) => {
                  return (
                    <Link
                      key={scenario.id}
                      to={getRoute('/scenarios/:scenarioId', {
                        scenarioId: fromUUID(scenario.id),
                      })}
                    >
                      <div className="bg-grey-100 border-grey-90 flex flex-col gap-1 rounded-lg border border-solid p-4 hover:shadow-md">
                        <div className="text-m flex flex-row gap-2 font-bold">
                          {scenario.name}
                          {scenario.liveVersionId ? (
                            <Tag color="purple" className="capitalize">
                              {t('scenarios:live')}
                            </Tag>
                          ) : null}
                        </div>
                        <p className="text-s line-clamp-2 font-medium">
                          {scenario.description}
                        </p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="bg-grey-100 border-grey-90 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
                  <p className="text-s font-medium">
                    {t('scenarios:empty_scenario_list')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent error={useRouteError()} />;
}
