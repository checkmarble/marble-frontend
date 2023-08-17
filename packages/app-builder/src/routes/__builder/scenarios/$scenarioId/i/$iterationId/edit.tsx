import {
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
  usePermissionRedirect,
} from '@app-builder/components';
import { VersionSelect } from '@app-builder/components/Scenario/Iteration/VersionSelect';
import { type AstOperator } from '@app-builder/models/ast-operators';
import { type EditorIdentifiersByType } from '@app-builder/models/identifier';
import { type ScenarioIteration } from '@app-builder/models/scenario';
import { sortScenarioIterations } from '@app-builder/models/scenario-iteration';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { DeploymentModal } from '@app-builder/routes/ressources/scenarios/deployment';
import {
  EditorIdentifiersProvider,
  EditorOperatorsProvider,
} from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs, redirect } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Tag } from '@ui-design-system';
import { Decision, Rules, Trigger } from '@ui-icons';
import { type Namespace } from 'i18next';
import * as R from 'remeda';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

const LINKS: ScenariosLinkProps[] = [
  { labelTKey: 'navigation:scenario.trigger', to: './trigger', Icon: Trigger },
  { labelTKey: 'navigation:scenario.rules', to: './rules', Icon: Rules },
  {
    labelTKey: 'navigation:scenario.decision',
    to: './decision',
    Icon: Decision,
  },
];

interface LoaderResponse {
  scenarioIterations: ScenarioIteration[];
  currentIteration: ScenarioIteration;
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
}

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient, editor } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const iterationId = fromParams(params, 'iterationId');
  const scenarioId = fromParams(params, 'scenarioId');

  const scenarioIterations = await apiClient.listScenarioIterations({
    scenarioId,
  });

  let currentIteration = scenarioIterations.find(
    ({ id }) => id === iterationId
  );

  if (currentIteration && currentIteration.version !== null) {
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/view', {
        scenarioId: fromUUID(currentIteration.scenarioId),
        iterationId: fromUUID(currentIteration.id),
      })
    );
  } else {
    currentIteration = R.sortBy(scenarioIterations, [
      ({ createdAt }) => createdAt,
      'desc',
    ])[0];
  }
  const operators = await editor.listOperators({
    scenarioId,
  });

  const identifiers = await editor.listIdentifiers({
    scenarioId,
  });

  return json({
    scenarioIterations: scenarioIterations,
    currentIteration: currentIteration,
    identifiers: identifiers,
    operators: operators,
  });
}

export default function ScenarioEditLayout() {
  const currentScenario = useCurrentScenario();
  const { scenarioIterations, currentIteration, identifiers, operators } =
    useLoaderData<typeof loader>() as LoaderResponse;

  usePermissionRedirect('canManageScenario', {
    redirectUrl: getRoute('/scenarios/:scenarioId/i/:iterationId/view', {
      scenarioId: fromUUID(currentIteration.scenarioId),
      iterationId: fromUUID(currentIteration.id),
    }),
  });

  const sortedScenarioIterations = sortScenarioIterations(
    scenarioIterations,
    currentScenario.liveVersionId
  );

  const iterationId = useParam('iterationId');

  const currentIterationSorted = sortedScenarioIterations.find(
    ({ id }) => id === iterationId
  ) ?? {
    ...currentIteration,
    type:
      currentIteration.version !== null
        ? ('live version' as const)
        : ('draft' as const),
  };
  return (
    <ScenarioPage.Container>
      <EditorIdentifiersProvider identifiers={identifiers}>
        <EditorOperatorsProvider operators={operators}>
          <ScenarioPage.Header className="justify-between">
            <div className="flex flex-row items-center gap-4">
              <Link to={getRoute('/scenarios')}>
                <ScenarioPage.BackButton />
              </Link>
              {currentScenario.name}
              <VersionSelect
                scenarioIterations={sortedScenarioIterations}
                currentIteration={currentIterationSorted}
              />
              <Tag size="big" border="square">
                Edit
              </Tag>
            </div>
            <div className="flex-column flex gap-4">
              <DeploymentModal
                scenarioId={currentScenario.id}
                liveVersionId={currentScenario.liveVersionId}
                currentIteration={{ ...currentIteration, type: 'draft' }}
              />
            </div>
          </ScenarioPage.Header>
          <ScenarioPage.Content className="max-w-3xl overflow-scroll">
            <Scenarios.Nav>
              {LINKS.map((linkProps) => (
                <li key={linkProps.labelTKey}>
                  <Scenarios.Link {...linkProps} />
                </li>
              ))}
            </Scenarios.Nav>
            <Outlet />
          </ScenarioPage.Content>
        </EditorOperatorsProvider>
      </EditorIdentifiersProvider>
    </ScenarioPage.Container>
  );
}
