import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { FiltersButton } from '@app-builder/components/Filters';
import { CreateTestRun } from '@app-builder/components/Scenario/Actions/CreateTestRun';
import {
  type TestRunsFilters,
  TestRunsFiltersBar,
  TestRunsFiltersMenu,
  TestRunsFiltersProvider,
} from '@app-builder/components/Scenario/TestRun/Filters';
import { testRunsFilterNames } from '@app-builder/components/Scenario/TestRun/Filters/filters';
import { TestRunSelector } from '@app-builder/components/Scenario/TestRun/TestRunSelector';
import { useDetectionScenarioData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isForbiddenHttpError, isNotFoundHttpError, type User } from '@app-builder/models';
import type { ScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { fromParams } from '@app-builder/utils/short-uuid';
import * as Sentry from '@sentry/react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { allPass, filter, mapToObj, pick } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

const testRunsLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function testRunsLoader({ data, context }) {
    const scenarioId = fromParams(data?.params ?? {}, 'scenarioId');
    const { testRun } = context.authInfo;

    try {
      return { runs: await testRun.listTestRuns({ scenarioId }) };
    } catch (error) {
      if (isNotFoundHttpError(error) || isForbiddenHttpError(error)) {
        throw redirect({ to: '/detection/scenarios' });
      } else {
        throw error;
      }
    }
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/test-run/')({
  loader: ({ params }) => testRunsLoader({ data: { params } }),
  errorComponent: ({ error }) => {
    Sentry.captureException(error);
    return <ErrorComponent error={error} />;
  },
  component: TestRuns,
});

function TestRuns() {
  const { t } = useTranslation(['scenarios']);
  const { runs } = Route.useLoaderData();
  const { currentScenario, scenarioIterations } = useDetectionScenarioData();
  const { orgUsers } = useOrganizationUsers();
  const [filters, setFilters] = useState<TestRunsFilters>({});

  const iterations = useMemo(
    () =>
      mapToObj(scenarioIterations as ScenarioIterationSummaryWithType[], (i) => [i.id, pick(i, ['version', 'type'])]),
    [scenarioIterations],
  );

  const atLeastOneActiveTestRun = runs.some((run) => run.status === 'up');

  const filteredRuns = useMemo(() => {
    const { statuses, startedAfter, creators, ref_versions, test_versions } = filters;

    return filter(runs, (r) =>
      allPass(r, [
        (r) => !statuses || !statuses.length || statuses.includes(r.status),
        (r) => !startedAfter || new Date(r.startDate).getTime() > startedAfter.getTime(),
        (r) => !creators || !creators.length || creators.includes(r.creatorId),
        (r) => !ref_versions || !ref_versions.length || ref_versions.includes(r.refIterationId),
        (r) => !test_versions || !test_versions.length || test_versions.includes(r.testIterationId),
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
        <BreadCrumbs />
      </Page.Header>

      <Page.Container>
        <Page.Content className="max-w-(--breakpoint-lg)">
          <div className="flex flex-col gap-4">
            <TestRunsFiltersProvider submitTestRunsFilters={setFilters} filterValues={filters}>
              <div className="flex flex-row items-center justify-between">
                <span className="text-grey-primary text-l font-semibold">{t('scenarios:testrun.home')}</span>
                <div className="flex flex-row gap-4">
                  <TestRunsFiltersMenu filterNames={testRunsFilterNames} scenarioIterations={scenarioIterations}>
                    <FiltersButton />
                  </TestRunsFiltersMenu>
                  <CreateTestRun
                    currentScenario={currentScenario}
                    scenarioIterations={scenarioIterations}
                    atLeastOneActiveTestRun={atLeastOneActiveTestRun}
                  >
                    <Button variant="primary" className="isolate h-10 w-fit">
                      <Icon icon="plus" className="size-5" aria-hidden />
                      {t('scenarios:create_testrun.title')}
                    </Button>
                  </CreateTestRun>
                </div>
              </div>
              <TestRunsFiltersBar scenarioIterations={scenarioIterations} />
              <div className="flex flex-col gap-2">
                <div className="text-s grid grid-cols-[30%_30%_8%_auto] font-semibold">
                  <span className="px-4">{t('scenarios:testrun.filters.version')}</span>
                  <span className="px-4">{t('scenarios:testrun.filters.started_after')}</span>
                  <span className="text-center">{t('scenarios:testrun.filters.creator')}</span>
                  <span className="px-4">{t('scenarios:testrun.filters.status')}</span>
                </div>
                {filteredRuns.map((run) => (
                  <TestRunSelector
                    {...run}
                    key={run.id}
                    users={users}
                    iterations={iterations}
                    scenario={currentScenario}
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
