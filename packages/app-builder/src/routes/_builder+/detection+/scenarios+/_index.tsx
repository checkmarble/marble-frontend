import { ErrorComponent, Page } from '@app-builder/components';
import { DetectionNavigationTabs } from '@app-builder/components/Detection';
import { CreateScenario } from '@app-builder/components/Scenario/Actions/CreateScenario';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link, useLoaderData, useRouteError } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['scenarios', 'navigation'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function scenariosLoader({ context }) {
  return {
    scenarios: await context.authInfo.scenario.listScenarios(),
  };
});

export default function DetectionScenariosPage() {
  const { t } = useTranslation(handle.i18n);
  const { scenarios } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md">
          <DetectionNavigationTabs
            actions={
              <CreateScenario>
                <Button>
                  <Icon icon="plus" className="size-6" aria-hidden />
                  {t('scenarios:create_scenario.title')}
                </Button>
              </CreateScenario>
            }
          />
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="flex flex-col gap-2 lg:gap-4">
              {scenarios.length ? (
                scenarios.map((scenario) => {
                  return (
                    <Link
                      key={scenario.id}
                      to={getRoute('/detection/scenarios/:scenarioId', {
                        scenarioId: fromUUIDtoSUUID(scenario.id),
                      })}
                    >
                      <div className="bg-surface-card border-grey-border flex flex-col gap-1 rounded-lg border border-solid p-4 hover:shadow-md dark:hover:border-purple-hover">
                        <div className="text-m flex flex-row gap-2 font-bold">
                          {scenario.name}
                          {scenario.liveVersionId ? (
                            <Tag color="purple" className="capitalize">
                              {t('scenarios:live')}
                            </Tag>
                          ) : null}
                        </div>
                        {scenario.description ? (
                          <p className="text-s line-clamp-2 font-medium">{scenario.description}</p>
                        ) : null}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="bg-surface-card border-grey-border flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
                  <p className="text-s font-medium">{t('scenarios:empty_scenario_list')}</p>
                </div>
              )}
            </div>
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  return <ErrorComponent error={useRouteError()} />;
}
