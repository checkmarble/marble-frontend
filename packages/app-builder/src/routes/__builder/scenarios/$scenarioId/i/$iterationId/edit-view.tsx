import {
  Callout,
  navigationI18n,
  ScenarioPage,
  Scenarios,
  type ScenariosLinkProps,
  usePermissionsContext,
} from '@app-builder/components';
import { VersionSelect } from '@app-builder/components/Scenario/Iteration/VersionSelect';
import { sortScenarioIterations } from '@app-builder/models/scenario-iteration';
import { useCurrentScenario } from '@app-builder/routes/__builder/scenarios/$scenarioId';
import { CreateDraftIteration } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/create_draft';
import { DeploymentModal } from '@app-builder/routes/ressources/scenarios/deployment';
import { EditorModeContextProvider } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
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

const LINKS: ScenariosLinkProps[] = [
  { labelTKey: 'navigation:scenario.trigger', to: './trigger', Icon: Trigger },
  { labelTKey: 'navigation:scenario.rules', to: './rules', Icon: Rules },
  {
    labelTKey: 'navigation:scenario.decision',
    to: './decision',
    Icon: Decision,
  },
];

export async function loader({ request, params }: LoaderArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const scenarioValidationPromise = scenario.validate({
    iterationId: iterationId,
  });

  const scenarioIterationsPromise = scenario.listScenarioIterations({
    scenarioId,
  });

  return json({
    scenarioIterations: await scenarioIterationsPromise,
    scenarioValidation: await scenarioValidationPromise,
  });
}

export default function ScenarioEditLayout() {
  const { t } = useTranslation(handle.i18n);
  const currentScenario = useCurrentScenario();
  const { scenarioIterations, scenarioValidation } =
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

  const editorMode =
    canManageScenario && currentIteration.type === 'draft' ? 'edit' : 'view';

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
        <div className="flex-column flex gap-4">
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
        <SanityErrors errors={scenarioValidation?.errors ?? []} />
        <Scenarios.Nav>
          {LINKS.map((linkProps) => (
            <li key={linkProps.labelTKey}>
              <Scenarios.Link {...linkProps} />
            </li>
          ))}
        </Scenarios.Nav>
        <EditorModeContextProvider value={editorMode}>
          <Outlet />
        </EditorModeContextProvider>
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}

function SanityErrors({ errors }: { errors: string[] }) {
  const { t } = useTranslation(handle.i18n);

  if (errors.length === 0) return null;

  return (
    <Callout variant="error" className="w-fit">
      <div className="flex flex-col">
        <p>
          {t('common:error', {
            count: errors.length,
          })}
        </p>
        <ul className="list-inside list-disc">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    </Callout>
  );
}
