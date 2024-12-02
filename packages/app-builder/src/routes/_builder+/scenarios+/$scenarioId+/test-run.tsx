import {
  CursorPaginationButtons,
  ErrorComponent,
  Page,
  paginationSchema,
  scenarioI18n,
} from '@app-builder/components';
import { FiltersButton } from '@app-builder/components/Filters';
import {
  emptyTestRunsFilters,
  type TestRunsFilters,
  TestRunsFiltersBar,
  TestRunsFiltersMenu,
  TestRunsFiltersProvider,
  testRunsFiltersSchema,
} from '@app-builder/components/Scenario/TestRun/Filters';
import { testRunsFilterNames } from '@app-builder/components/Scenario/TestRun/Filters/filters';
import { TestRunPreview } from '@app-builder/components/Scenario/TestRun/TestRunPreview';
import {
  isForbiddenHttpError,
  isNotFoundHttpError,
  type User,
} from '@app-builder/models';
import { type PaginationParams } from '@app-builder/models/pagination';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { CreateTestRun } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/testrun+/create';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { parseQuerySafe } from '@app-builder/utils/input-validation';
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

import { useCurrentScenario, useScenarioIterations } from './_layout';

export const handle = {
  i18n: [...scenarioI18n] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const scenarioId = fromParams(params, 'scenarioId');
  const { testRunRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  try {
    return json({
      testRuns: await testRunRepository.listTestRuns({
        scenarioId: fromUUID(scenarioId),
      }),
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
  const { testRuns: runs } = useLoaderData<typeof loader>();
  const currentScenario = useCurrentScenario();
  const { orgUsers } = useOrganizationUsers();
  const scenarioIterations = useScenarioIterations();
  const [filters, setFilters] = useState<TestRunsFilters>({});

  const filteredRuns = useMemo(() => {
    return runs;
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

  const iterations = useMemo(
    () =>
      scenarioIterations.reduce(
        (acc, curr) => {
          acc[curr.id] = {
            version: curr.version,
            type: curr.type,
          };

          return acc;
        },
        {} as Record<
          string,
          Pick<ScenarioIterationWithType, 'version' | 'type'>
        >,
      ),
    [scenarioIterations],
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
        <p className="text-grey-50 line-clamp-2">
          {t('scenarios:home.testrun')}
        </p>
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
                <span className="text-grey-100 font-semibold">
                  {t('scenarios:testrun.history')}
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
                  <TestRunPreview
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
