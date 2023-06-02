import { Page } from '@marble-front/builder/components';
import { authenticator } from '@marble-front/builder/services/auth/auth.server';
import { getRoute } from '@marble-front/builder/services/routes';
import { fromUUID } from '@marble-front/builder/utils/short-uuid';
import { Tag } from '@marble-front/ui/design-system';
import { Scenarios } from '@marble-front/ui/icons';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';

export const handle = {
  i18n: ['scenarios', 'navigation'] satisfies Namespace,
};

export async function loader({ request }: LoaderArgs) {
  const { apiClient } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const scenarios = await apiClient.listScenarios();

  const sortedScenarios = R.sortBy(scenarios, [
    ({ createdAt }) => createdAt,
    'desc',
  ]);

  return json(sortedScenarios);
}

export default function ScenariosPage() {
  const { t } = useTranslation(handle.i18n);
  const scenarios = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header>
        <Scenarios className="mr-2" height="24px" width="24px" />
        {t('navigation:scenarios')}
      </Page.Header>
      <Page.Content>
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
                  <div className="bg-grey-00 border-grey-10 flex max-w-3xl flex-col gap-1 rounded-lg border border-solid p-4 hover:shadow-md">
                    <div className="text-m flex flex-row gap-2 font-bold">
                      {scenario.name}
                      {scenario.liveVersionId && (
                        <Tag color="purple" className="capitalize">
                          {t('scenarios:live')}
                        </Tag>
                      )}
                    </div>
                    <p className="text-s line-clamp-2 font-medium">
                      {scenario.description}
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="bg-grey-00 border-grey-10 flex h-28 max-w-3xl flex-col items-center justify-center rounded-lg border border-solid p-4">
              <p className="text-s font-medium">
                {t('scenarios:empty_scenario_list')}
              </p>
            </div>
          )}
        </div>
      </Page.Content>
    </Page.Container>
  );
}
