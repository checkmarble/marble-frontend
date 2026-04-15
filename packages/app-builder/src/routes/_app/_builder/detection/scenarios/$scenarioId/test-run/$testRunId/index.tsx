import { CopyToClipboardButton, Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CancelTestRun } from '@app-builder/components/Scenario/TestRun/Actions/CancelTestRun';
import { DistributionOfDecisionChart } from '@app-builder/components/Scenario/TestRun/Graphs/DistributionOfDecisionChart';
import { FilterTransactionByDecision } from '@app-builder/components/Scenario/TestRun/Graphs/FilterTransactionByDecision';
import { type Versions } from '@app-builder/components/Scenario/TestRun/Graphs/HamburgerGraph';
import { DistributionOfDecisionChartSkeleton } from '@app-builder/components/Scenario/TestRun/Skeletons/DistributionOfDecicionSkeleton';
import { FilterTransactionByDecisionSkeleton } from '@app-builder/components/Scenario/TestRun/Skeletons/FilterTransactionByDecicionSkeleton';
import { TestRunDetails } from '@app-builder/components/Scenario/TestRun/TestRunDetails';
import { useDetectionScenarioData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import type { ScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Await, createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mapToObj, pick } from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

const testRunLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function testRunLoader({ data, context }) {
    const testRunId = fromParams(data?.params ?? {}, 'testRunId');
    const { testRun } = context.authInfo;

    const decisionsPromise = testRun.listDecisions({ testRunId });
    const rulesPromise = testRun.listRuleExecutions({ testRunId });
    const run = await testRun.getTestRun({ testRunId });

    return { run, decisionsPromise, rulesPromise };
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/test-run/$testRunId/')({
  loader: ({ params }) => testRunLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { run } = Route.useLoaderData();
        const { t } = useTranslation(['scenarios']);

        return (
          <div className="flex items-center gap-4">
            <BreadCrumbLink
              isLast={isLast}
              to="/detection/scenarios/$scenarioId/test-run/$testRunId"
              params={{ scenarioId: fromUUIDtoSUUID(run.scenarioId), testRunId: fromUUIDtoSUUID(run.id) }}
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
  },
  component: TestRun,
});

function TestRun() {
  const { run, decisionsPromise, rulesPromise } = Route.useLoaderData();
  const { currentScenario, scenarioIterations } = useDetectionScenarioData();
  const { orgUsers } = useOrganizationUsers();
  const { t } = useTranslation(['scenarios']);

  const iterations = useMemo(
    () =>
      mapToObj(scenarioIterations as ScenarioIterationSummaryWithType[], (i) => [i.id, pick(i, ['version', 'type'])]),
    [scenarioIterations],
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

  const creator = useMemo(() => orgUsers.find((u) => u.userId === run.creatorId), [orgUsers, run.creatorId]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        {run.status === 'up' ? (
          <CancelTestRun currentScenario={currentScenario} testRunId={run.id}>
            <Button variant="destructive" className="isolate h-10 w-fit">
              <Icon icon="stop" className="size-5" />
              {t('scenarios:testrun.cancel')}
            </Button>
          </CancelTestRun>
        ) : null}
      </Page.Header>

      <Page.Container>
        <Page.Content className="flex max-w-(--breakpoint-lg) flex-col gap-8">
          <TestRunDetails {...run} iterations={iterations} creator={creator} />
          <Await promise={decisionsPromise} fallback={<DistributionOfDecisionChartSkeleton />}>
            {(decisions) => <DistributionOfDecisionChart versions={versions} decisions={decisions} />}
          </Await>
          <Await promise={rulesPromise} fallback={<FilterTransactionByDecisionSkeleton />}>
            {(rules) => <FilterTransactionByDecision versions={versions} rules={rules} />}
          </Await>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
