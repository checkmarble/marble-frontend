import {
  navigationI18n,
  Page,
  ScenariosLink,
  usePermissionsContext,
} from '@app-builder/components';
import { CornerPing } from '@app-builder/components/Ping';
import { VersionSelect } from '@app-builder/components/Scenario/Iteration/VersionSelect';
import { sortScenarioIterations } from '@app-builder/models/scenario-iteration';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { CreateDraftIteration } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create_draft';
import { DeploymentActions } from '@app-builder/routes/ressources+/scenarios+/deployment';
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
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const scenarioIterations = await scenario.listScenarioIterations({
    scenarioId,
  });

  return json({
    scenarioIterations,
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
    currentScenario.liveVersionId,
  );

  const iterationId = useParam('iterationId');

  const currentIteration = sortedScenarioIterations.find(
    ({ id }) => id === iterationId,
  );
  const draftIteration = sortedScenarioIterations.find(
    ({ version }) => version === null,
  );
  invariant(currentIteration, 'currentIteration is required');

  const editorMode = useEditorMode();

  const withEditTag = editorMode === 'edit';
  const withCreateDraftIteration =
    canManageScenario && currentIteration.type !== 'draft';
  const withDeploymentActions = canPublishScenario;

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to={getRoute('/scenarios/')}>
            <Page.BackButton />
          </Link>
          {currentScenario.name}
          <VersionSelect
            scenarioIterations={sortedScenarioIterations}
            currentIteration={currentIteration}
          />
          {withEditTag ? (
            <Tag size="big" border="square">
              {t('common:edit')}
            </Tag>
          ) : null}
        </div>
        <div className="flex flex-row items-center gap-4">
          {withCreateDraftIteration ? (
            <CreateDraftIteration
              iterationId={currentIteration.id}
              scenarioId={currentScenario.id}
              draftId={draftIteration?.id}
            />
          ) : null}
          {withDeploymentActions ? (
            <DeploymentActions
              scenarioId={currentScenario.id}
              liveVersionId={currentScenario.liveVersionId}
              currentIteration={currentIteration}
              hasScenarioErrors={
                hasTriggerErrors(scenarioValidation) ||
                hasRulesErrors(scenarioValidation) ||
                hasDecisionErrors(scenarioValidation)
              }
            />
          ) : null}
        </div>
      </Page.Header>
      <Page.Content>
        <nav>
          <ul className="flex flex-row gap-2">
            <li>
              <ScenariosLink
                aria-invalid={hasTriggerErrors(scenarioValidation)}
                labelTKey="navigation:scenario.trigger"
                to="./trigger"
                Icon={(props) => (
                  <ScenariosLinkIcon
                    {...props}
                    icon="trigger"
                    withPing={hasTriggerErrors(scenarioValidation)}
                  />
                )}
              />
            </li>
            <li>
              <ScenariosLink
                aria-invalid={hasRulesErrors(scenarioValidation)}
                labelTKey="navigation:scenario.rules"
                to="./rules"
                Icon={(props) => (
                  <ScenariosLinkIcon
                    {...props}
                    icon="rules"
                    withPing={hasRulesErrors(scenarioValidation)}
                  />
                )}
              />
            </li>
            <li>
              <ScenariosLink
                aria-invalid={hasDecisionErrors(scenarioValidation)}
                labelTKey="navigation:scenario.decision"
                to="./decision"
                Icon={(props) => (
                  <ScenariosLinkIcon
                    {...props}
                    icon="decision"
                    withPing={hasDecisionErrors(scenarioValidation)}
                  />
                )}
              />
            </li>
          </ul>
        </nav>
        <Outlet />
      </Page.Content>
    </Page.Container>
  );
}

function ScenariosLinkIcon({
  withPing,
  ...props
}: React.ComponentPropsWithoutRef<typeof Icon> & { withPing: boolean }) {
  if (withPing) {
    return (
      <CornerPing position="top-right">
        <Icon {...props} />
      </CornerPing>
    );
  }
  return <Icon {...props} />;
}
