import {
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
  usePermissionsContext,
} from '@app-builder/components';
import { VersionSelect } from '@app-builder/components/Scenario/Iteration/VersionSelect';
import type { ScenarioIterationSummary } from '@app-builder/models';
import { type AstOperator } from '@app-builder/models/ast-operators';
import { type EditorIdentifiersByType } from '@app-builder/models/identifier';
import { sortScenarioIterations } from '@app-builder/models/scenario-iteration';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { CreateDraftIteration } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/create_draft';
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
import { Decision, Rules, Trigger } from '@ui-icons';
import { type Namespace } from 'i18next';
import invariant from 'tiny-invariant';

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
  scenarioIterations: ScenarioIterationSummary[];
  identifiers: EditorIdentifiersByType;
  operators: AstOperator[];
}

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { editor, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const scenarioIterations = await scenario.listScenarioIterations({
    scenarioId,
  });

  const iterationId = fromParams(params, 'iterationId');

  const currentIteration = scenarioIterations.find(
    ({ id }) => id === iterationId
  );
  if (
    user.permissions.canManageScenario &&
    currentIteration?.version === null
  ) {
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/edit', {
        scenarioId: fromUUID(currentIteration.scenarioId),
        iterationId: fromUUID(currentIteration.id),
      })
    );
  }
  const operators = await editor.listOperators({
    scenarioId,
  });

  const identifiers = await editor.listIdentifiers({
    scenarioId,
  });
  return json<LoaderResponse>({
    scenarioIterations: scenarioIterations,
    identifiers: identifiers,
    operators: operators,
  });
}

export default function ScenarioViewLayout() {
  const currentScenario = useCurrentScenario();
  const { scenarioIterations, identifiers, operators } =
    useLoaderData<typeof loader>();
  const { canManageScenario, canPublishScenario } = usePermissionsContext();

  const sortedScenarioIterations = sortScenarioIterations(
    scenarioIterations,
    currentScenario.liveVersionId
  );

  const iterationId = useParam('iterationId');

  const currentIteration = sortedScenarioIterations.find(
    ({ id }) => id === iterationId
  );
  const draftIteration = sortedScenarioIterations.find(
    ({ version }) => version === null
  );
  invariant(currentIteration, 'currentIteration is required');

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to={getRoute('/scenarios')}>
            <ScenarioPage.BackButton />
          </Link>
          {currentScenario.name}
          <VersionSelect
            scenarioIterations={sortedScenarioIterations}
            currentIteration={currentIteration}
          />
        </div>
        <div className="flex-column flex gap-4">
          {canManageScenario && (
            <CreateDraftIteration
              iterationId={currentIteration.id}
              scenarioId={currentScenario.id}
              draftId={draftIteration?.id}
            />
          )}
          {canPublishScenario && (
            <DeploymentModal
              scenarioId={currentScenario.id}
              liveVersionId={currentScenario.liveVersionId}
              currentIteration={currentIteration}
            />
          )}
        </div>
      </ScenarioPage.Header>
      <EditorIdentifiersProvider identifiers={identifiers}>
        <EditorOperatorsProvider operators={operators}>
          <ScenarioPage.Content>
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
