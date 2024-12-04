import { Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { TriggerObjectTag } from '@app-builder/components/Scenario/TriggerObjectTag';
import { TestRunDetails } from '@app-builder/components/Scenario/TestRun/TestRunDetails';
import { adaptScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { useMemo } from 'react';
import { mapToObj, pick } from 'remeda';
import { SanKeyChart } from '@app-builder/components/Scenario/TestRun/Graphs/SanKeyChart';
import { FilterTransactionByDecision } from '@app-builder/components/Scenario/TestRun/Graphs/FilterTransactionByDecision';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
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
            decisions={[
              { version: 'v1', outcome: 'approve', count: 10 },
              { version: 'v2', outcome: 'approve', count: 20 },
              { version: 'v1', outcome: 'decline', count: 5 },
              { version: 'v1', outcome: 'approve', count: 30 },
              { version: 'v2', outcome: 'decline', count: 15 },
              { version: 'v1', outcome: 'review', count: 9 },
              { version: 'v2', outcome: 'review', count: 22 },
              { version: 'v1', outcome: 'block_and_review', count: 20 },
            ]}
          />
          <FilterTransactionByDecision />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
