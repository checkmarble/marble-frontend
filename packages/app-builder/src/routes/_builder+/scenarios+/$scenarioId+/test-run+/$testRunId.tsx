import { Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';
import { TestRunDetails } from '@app-builder/components/Scenario/TestRun/TestRunDetails';
import { adaptScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { useMemo } from 'react';
import { mapToObj, pick } from 'remeda';
import { SanKeyChart } from '@app-builder/components/Scenario/TestRun/Graphs/SanKeyChart';
import { FilterTransactionByDecision } from '@app-builder/components/Scenario/TestRun/Graphs/FilterTransactionByDecision';

export type VersionSummary = {
  ref: {
    type: string;
    version: string;
  };
  test: {
    type: string;
    version: string;
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const testRunId = fromParams(params, 'testRunId');
  const scenarioId = fromParams(params, 'scenarioId');
  const { testRun, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const [run, iterations, currentScenario] = await Promise.all([
    testRun.getTestRun({ testRunId }),
    scenario.listScenarioIterations({ scenarioId }),
    scenario.getScenario({ scenarioId }),
  ]);

  return json({
    run,
    currentScenario,
    iterations: mapToObj(iterations, (i) => [
      i.id,
      pick(adaptScenarioIterationWithType(i, currentScenario.liveVersionId), [
        'version',
        'type',
      ]),
    ]),
  });
}

export default function TestRun() {
  const { run, iterations, currentScenario } = useLoaderData<typeof loader>();
  const { orgUsers } = useOrganizationUsers();

  const versionSummary: VersionSummary = {
    ref: {
      type: iterations[run.refIterationId]!.type,
      version: `V${iterations[run.refIterationId]!.version}`,
    },
    test: {
      type: iterations[run.testIterationId]!.type,
      version: `V${iterations[run.testIterationId]!.version}`,
    },
  };

  const creator = useMemo(
    () => orgUsers.find((u) => u.userId === run.creatorId),
    [orgUsers],
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
          <SanKeyChart
            versionSummary={versionSummary}
            decisions={[
              { version: 'V1', outcome: 'approve', count: 10 },
              { version: 'V4', outcome: 'approve', count: 20 },
              { version: 'V1', outcome: 'decline', count: 5 },
              { version: 'V1', outcome: 'approve', count: 30 },
              { version: 'V4', outcome: 'decline', count: 15 },
              { version: 'V1', outcome: 'review', count: 9 },
              { version: 'V4', outcome: 'review', count: 22 },
              { version: 'V1', outcome: 'block_and_review', count: 20 },
            ]}
          />
          <FilterTransactionByDecision
            versionSummary={versionSummary}
            rules={[
              {
                version: 'V1',
                name: 'Rule 1 name',
                status: 'hit',
                total: 10,
                rule_id: 'rule-1',
              },
              {
                version: 'V4',
                name: 'Rule 1 name',
                status: 'hit',
                total: 15,
                rule_id: 'rule-1',
              },
              {
                version: 'V1',
                name: 'Rule 1 name',
                status: 'no_hit',
                total: 20,
                rule_id: 'rule-1',
              },
              {
                version: 'V4',
                name: 'Rule 1 name',
                status: 'no_hit',
                total: 15,
                rule_id: 'rule-1',
              },
              {
                version: 'V1',
                name: 'Rule 1 name',
                status: 'error',
                total: 5,
                rule_id: 'rule-1',
              },
              {
                version: 'V4',
                name: 'Rule 1 name',
                status: 'snoozed',
                total: 5,
                rule_id: 'rule-1',
              },
              {
                version: 'V1',
                name: 'Rule 2 name',
                status: 'no_hit',
                total: 5,
                rule_id: 'rule-2',
              },
              {
                version: 'V4',
                name: 'New Rule 2 name',
                status: 'no_hit',
                total: 0, // I don't know if this is a possible return from the backend but I'm adding it here to test the UI
                rule_id: 'rule-2',
              },
              {
                version: 'V1',
                name: 'Rule 2 name',
                status: 'hit',
                total: 15,
                rule_id: 'rule-2',
              },
              {
                version: 'V4',
                name: 'New Rule 2 name',
                status: 'hit',
                total: 50,
                rule_id: 'rule-2',
              },
              {
                version: 'V1',
                name: 'Rule 2 name',
                status: 'error',
                total: 15,
                rule_id: 'rule-2',
              },
            ]}
          />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
