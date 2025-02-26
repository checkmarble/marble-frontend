import { CopyToClipboardButton, Page } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { DistributionOfDecisionChart } from '@app-builder/components/Scenario/TestRun/Graphs/DistributionOfDecisionChart';
import { FilterTransactionByDecision } from '@app-builder/components/Scenario/TestRun/Graphs/FilterTransactionByDecision';
import { type Versions } from '@app-builder/components/Scenario/TestRun/Graphs/HamburgerGraph';
import { DistributionOfDecisionChartSkeleton } from '@app-builder/components/Scenario/TestRun/Skeletons/DistributionOfDecicionSkeleton';
import { FilterTransactionByDecisionSkeleton } from '@app-builder/components/Scenario/TestRun/Skeletons/FilterTransactionByDecicionSkeleton';
import { TestRunDetails } from '@app-builder/components/Scenario/TestRun/TestRunDetails';
import { adaptScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { CancelTestRun } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/testrun+/$testRunId+/cancel';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { defer, type LoaderFunctionArgs } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mapToObj, pick } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCurrentScenario, useScenarioIterations } from '../../_layout';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { run } = useLoaderData<typeof loader>();
      const { t } = useTranslation(['scenarios']);

      return (
        <div className="flex items-center gap-4">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/scenarios/:scenarioId/test-run/:testRunId/', {
              scenarioId: fromUUID(run.scenarioId),
              testRunId: fromUUID(run.id),
            })}
          >
            {t('scenarios:home.testrun')}
          </BreadCrumbLink>
          <CopyToClipboardButton toCopy={run.id}>
            <span className="text-s line-clamp-1 max-w-40 font-normal">
              <span className="font-medium">ID</span> {run.id}
            </span>
          </CopyToClipboardButton>
        </div>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const testRunId = fromParams(params, 'testRunId');
  const { testRun } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const decisionsPromise = testRun.listDecisions({ testRunId });
  const rulesPromise = testRun.listRuleExecutions({ testRunId });
  const run = await testRun.getTestRun({ testRunId });

  return defer({ run, decisionsPromise, rulesPromise });
}

export default function TestRun() {
  const { run, decisionsPromise, rulesPromise } = useLoaderData<typeof loader>();
  const currentScenario = useCurrentScenario();
  const sourceIterations = useScenarioIterations();
  const { orgUsers } = useOrganizationUsers();
  const { t } = useTranslation(['scenarios']);

  const iterations = useMemo(
    () =>
      mapToObj(sourceIterations, (i) => [
        i.id,
        pick(adaptScenarioIterationWithType(i, currentScenario.liveVersionId), ['version', 'type']),
      ]),
    [sourceIterations, currentScenario],
  );

  const versions = useMemo(
    () =>
      ({
        ref: {
          value: `${iterations[run.refIterationId]!.version}`,
          type: iterations[run.refIterationId]!.type,
        },
        test: {
          value: `${iterations[run.testIterationId]!.version}`,
          type: iterations[run.testIterationId]!.type,
        },
      }) satisfies Versions,
    [iterations, run.refIterationId, run.testIterationId],
  );

  const creator = useMemo(
    () => orgUsers.find((u) => u.userId === run.creatorId),
    [orgUsers, run.creatorId],
  );

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        {run.status === 'up' ? (
          <CancelTestRun testRunId={run.id}>
            <Button variant="secondary" color="red" className="isolate h-10 w-fit">
              <Icon icon="stop" className="text-grey-100 size-6" />
              <span className="text-grey-100">{t('scenarios:testrun.cancel')}</span>
            </Button>
          </CancelTestRun>
        ) : null}
      </Page.Header>

      <Page.Container>
        <Page.Content className="flex max-w-screen-lg flex-col gap-8">
          <TestRunDetails {...run} iterations={iterations} creator={creator} />
          <Suspense fallback={<DistributionOfDecisionChartSkeleton />}>
            <Await resolve={decisionsPromise}>
              {(decisions) => (
                <DistributionOfDecisionChart versions={versions} decisions={decisions} />
              )}
            </Await>
          </Suspense>
          <Suspense fallback={<FilterTransactionByDecisionSkeleton />}>
            <Await resolve={rulesPromise}>
              {(rules) => <FilterTransactionByDecision versions={versions} rules={rules} />}
            </Await>
          </Suspense>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
