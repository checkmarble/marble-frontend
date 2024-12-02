import { ErrorComponent, Page, scenarioI18n } from '@app-builder/components';
import { FiltersButton } from '@app-builder/components/Filters';
import {
  type TestRunsFilters,
  TestRunsFiltersBar,
  TestRunsFiltersMenu,
  TestRunsFiltersProvider,
} from '@app-builder/components/Scenario/TestRun/Filters';
import { testRunsFilterNames } from '@app-builder/components/Scenario/TestRun/Filters/filters';
import { TestRunSelector } from '@app-builder/components/Scenario/TestRun/TestRunSelector';
import {
  isForbiddenHttpError,
  isNotFoundHttpError,
  type User,
} from '@app-builder/models';
import {
  adaptScenarioIterationWithType,
  type ScenarioIterationWithType,
} from '@app-builder/models/scenario-iteration';
import { CreateTestRun } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/testrun+/create';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { type Namespace } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCurrentScenario } from './_layout';
import { allPass, filter, pick, mapToObj } from 'remeda';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const scenarioId = fromParams(params, 'scenarioId');
  const { testRun, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [runs, scenarioIterations, currScenario] = await Promise.all([
    testRun.listTestRuns({ scenarioId }),
    scenario.listScenarioIterations({ scenarioId }),
    scenario.getScenario({ scenarioId }),
  ]);

  try {
    return json({
      runs,
      iterations: mapToObj(scenarioIterations, (i) => [
        i.id,
        pick(adaptScenarioIterationWithType(i, currScenario.liveVersionId), [
          'version',
          'type',
        ]),
      ]),
    });
  } catch (error) {
    // if scenario is deleted or user no longer have access, the user is redirected
    if (isNotFoundHttpError(error) || isForbiddenHttpError(error)) {
      return redirect(getRoute('/scenarios/'));
    } else {
      throw error;
    }
  }
}

export default function TestRuns() {
  const { t } = useTranslation(handle.i18n);
  const { runs, iterations } = useLoaderData<typeof loader>();
  const currentScenario = useCurrentScenario();
  const { orgUsers } = useOrganizationUsers();
  const [filters, setFilters] = useState<TestRunsFilters>({});

  const filteredRuns = useMemo(() => {
    const { statuses, startedAfter, creators, ref_versions, test_versions } =
      filters;

    return filter(runs, (r) =>
      allPass(r, [
        (r) => !statuses || !statuses.length || statuses.includes(r.status),
        (r) => !startedAfter || +r.startDate > startedAfter.getTime(),
        (r) => !creators || !creators.length || creators.includes(r.creatorId),
        (r) =>
          !ref_versions ||
          !ref_versions.length ||
          ref_versions.includes(r.refIterationId),
        (r) =>
          !test_versions ||
          !test_versions.length ||
          test_versions.includes(r.testIterationId),
      ]),
    );
  }, [runs, filters]);

  const users = useMemo(
    () =>
      orgUsers.reduce(
        (acc, curr) => {
          acc[curr.userId] = {
            firstName: curr.firstName,
            lastName: curr.lastName,
          };

          return acc;
        },
        {} as Record<string, Pick<User, 'firstName' | 'lastName'>>,
      ),
    [orgUsers],
  );

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <Page.BackLink
          to={getRoute('/scenarios/:scenarioId/home', {
            scenarioId: fromUUID(currentScenario.id),
          })}
        />
        <p className="line-clamp-2 text-start">{currentScenario.name}</p>
        <TriggerObjectTag>{currentScenario.triggerObjectType}</TriggerObjectTag>
      </Page.Header>

      <Page.Container>
        <Page.Description>
          {t('scenarios:testrun.description')}
        </Page.Description>
        <Page.Content className="max-w-screen-lg">
          <div className="flex flex-col gap-4">
            <TestRunsFiltersProvider
              submitTestRunsFilters={setFilters}
              filterValues={filters}
            >
              <div className="flex flex-row items-center justify-between">
                <span className="text-grey-100 text-l font-semibold">
                  {t('scenarios:home.testrun')}
                </span>
                <div className="flex flex-row gap-4">
                  <TestRunsFiltersMenu filterNames={testRunsFilterNames}>
                    <FiltersButton />
                  </TestRunsFiltersMenu>
                  <CreateTestRun>
                    <Button variant="primary" className="isolate h-10 w-fit">
                      <Icon icon="plus" className="size-6" aria-hidden />
                      {t('scenarios:create_testrun.title')}
                    </Button>
                  </CreateTestRun>
                </div>
              </div>
              <TestRunsFiltersBar />
              <div className="flex flex-col gap-2">
                <div className="grid-cols-test-run text-s grid font-semibold">
                  <span className="px-4">
                    {t('scenarios:testrun.filters.version')}
                  </span>
                  <span className="px-4">
                    {t('scenarios:testrun.filters.started_after')}
                  </span>
                  <span className="text-center">
                    {t('scenarios:testrun.filters.creator')}
                  </span>
                  <span className="px-4">
                    {t('scenarios:testrun.filters.status')}
                  </span>
                </div>
                {filteredRuns.map((run) => (
                  <TestRunSelector
                    {...run}
                    key={run.id}
                    users={users}
                    iterations={iterations}
                  />
                ))}
              </div>
            </TestRunsFiltersProvider>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  return <ErrorComponent error={error} />;
}
