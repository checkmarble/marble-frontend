import {
  navigationI18n,
  ScenarioPage,
  Scenarios,
  usePermissionsContext,
} from '@app-builder/components';
import { withCornerPing } from '@app-builder/components/Ping';
import { VersionSelect } from '@app-builder/components/Scenario/Iteration/VersionSelect';
import { sortScenarioIterations } from '@app-builder/models/scenario-iteration';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { CreateDraftIteration } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/create_draft';
import { DeploymentModal } from '@app-builder/routes/ressources/scenarios/deployment';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  hasDecisionErrors,
  hasRulesErrors,
  hasTriggerErrors,
  useCurrentScenarioValidation,
} from '@app-builder/services/validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { Tag } from '@ui-design-system';
import { Decision, Rules, Trigger } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const scenarioIterationsPromise = scenario.listScenarioIterations({
    scenarioId,
  });

  return json({
    scenarioIterations: await scenarioIterationsPromise,
  });
}

export default function ScenarioEditLayout() {
  const { t } = useTranslation(handle.i18n);
  const currentScenario = useCurrentScenario();
  const scenarioValidation = useCurrentScenarioValidation();
  const { scenarioIterations } = useLoaderData<typeof loader>();
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

  const editorMode = useEditorMode();

  const withEditTag = editorMode === 'edit';
  const withCreateDraftIteration =
    canManageScenario && currentIteration.type !== 'draft';
  const withDeploymentModal = canPublishScenario;

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
          {withEditTag && (
            <Tag size="big" border="square">
              {t('common:edit')}
            </Tag>
          )}
        </div>
        <div className="flex flex-row items-center gap-4">
          {withCreateDraftIteration && (
            <CreateDraftIteration
              iterationId={currentIteration.id}
              scenarioId={currentScenario.id}
              draftId={draftIteration?.id}
            />
          )}
          {withDeploymentModal && (
            <DeploymentModal
              scenarioId={currentScenario.id}
              liveVersionId={currentScenario.liveVersionId}
              currentIteration={currentIteration}
            />
          )}
        </div>
      </ScenarioPage.Header>
      <ScenarioPage.Content>
        <Scenarios.Nav>
          <li>
            <Scenarios.Link
              aria-invalid={hasTriggerErrors(scenarioValidation)}
              labelTKey="navigation:scenario.trigger"
              to="./trigger"
              Icon={
                hasTriggerErrors(scenarioValidation)
                  ? withCornerPing({
                      children: <Trigger />,
                      variant: 'top-right',
                    })
                  : Trigger
              }
            />
          </li>
          <li>
            <Scenarios.Link
              aria-invalid={hasRulesErrors(scenarioValidation)}
              labelTKey="navigation:scenario.rules"
              to="./rules"
              Icon={
                hasRulesErrors(scenarioValidation)
                  ? withCornerPing({
                      children: <Rules />,
                      variant: 'top-right',
                    })
                  : Rules
              }
            />
          </li>
          <li>
            <Scenarios.Link
              aria-invalid={hasDecisionErrors(scenarioValidation)}
              labelTKey="navigation:scenario.decision"
              to="./decision"
              Icon={
                hasDecisionErrors(scenarioValidation)
                  ? withCornerPing({
                      children: <Decision />,
                      variant: 'top-right',
                    })
                  : Decision
              }
            />
          </li>
        </Scenarios.Nav>
        <Outlet />
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
