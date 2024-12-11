import { Page } from '@app-builder/components';
import { DistributionOfDecisionChart } from '@app-builder/components/Scenario/TestRun/Graphs/DistributionOfDecisionChart';
import { FilterTransactionByDecision } from '@app-builder/components/Scenario/TestRun/Graphs/FilterTransactionByDecision';
import { type Versions } from '@app-builder/components/Scenario/TestRun/Graphs/HamburgerGraph';
import { TestRunDetails } from '@app-builder/components/Scenario/TestRun/TestRunDetails';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';
import { adaptScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { defer, type LoaderFunctionArgs } from '@remix-run/node';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense, useMemo } from 'react';
import { mapToObj, pick } from 'remeda';

import { useCurrentScenario, useScenarioIterations } from '../_layout';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const testRunId = fromParams(params, 'testRunId');
  const { testRun } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const decisions = testRun.listDecisions({ testRunId });
  const rules = testRun.listRuleExecutions({ testRunId });
  const run = await testRun.getTestRun({ testRunId });

  return defer({ run, decisions, rules });
}

export default function TestRun() {
  const { run, decisions, rules } = useLoaderData<typeof loader>();
  const currentScenario = useCurrentScenario();
  const sourceIterations = useScenarioIterations();
  const { orgUsers } = useOrganizationUsers();

  const iterations = useMemo(
    () =>
      mapToObj(sourceIterations, (i) => [
        i.id,
        pick(adaptScenarioIterationWithType(i, currentScenario.liveVersionId), [
          'version',
          'type',
        ]),
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
      <Page.Header className="gap-4">
        <Page.BackLink
          to={getRoute('/scenarios/:scenarioId/test-run', {
            scenarioId: fromUUID(currentScenario.id),
          })}
        />
        <p className="line-clamp-2 text-start">{currentScenario.name}</p>
        <TriggerObjectTag>{currentScenario.triggerObjectType}</TriggerObjectTag>
      </Page.Header>

      <Page.Container>
        <Page.Content className="flex max-w-screen-lg flex-col gap-8">
          <TestRunDetails {...run} iterations={iterations} creator={creator} />
          <Suspense fallback="Loading... to have a skeleton">
            <Await resolve={decisions}>
              {(decisions) => (
                <DistributionOfDecisionChart
                  versions={versions}
                  decisions={decisions}
                />
              )}
            </Await>
          </Suspense>
          <Suspense fallback="Loading... to have a skeleton">
            <Await resolve={rules}>
              {(rules) => (
                <FilterTransactionByDecision
                  versions={versions}
                  rules={rules}
                />
              )}
            </Await>
          </Suspense>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
