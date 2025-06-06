import { navigationI18n, Page, TabLink } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CornerPing } from '@app-builder/components/Ping';
import {
  useCurrentScenario,
  useScenarioIterations,
} from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { ActivateScenarioVersion } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/activate';
import { CommitScenarioDraft } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/commit';
import { CreateDraftIteration } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create_draft';
import { DeactivateScenarioVersion } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate';
import { PrepareScenarioVersion } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/prepare';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import {
  isCreateDraftAvailable,
  isDeploymentActionsAvailable,
} from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import {
  hasDecisionErrors,
  hasRulesErrors,
  hasTriggerErrors,
} from '@app-builder/services/validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCurrentScenarioValidation } from '../_layout';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const iterationId = fromParams(params, 'iterationId');

  if (!isDeploymentActionsAvailable(user)) {
    return json({
      isDeploymentActionsAvailable: false as const,
      isCreateDraftAvailable: isCreateDraftAvailable(user),
    });
  }

  const publicationPreparationStatus = await scenario.getPublicationPreparationStatus({
    iterationId,
  });

  return json({
    isDeploymentActionsAvailable: true as const,
    isCreateDraftAvailable: isCreateDraftAvailable(user),
    publicationPreparationStatus,
  });
}

export default function ScenarioEditLayout() {
  const { t } = useTranslation(handle.i18n);
  const currentScenario = useCurrentScenario();
  const scenarioValidation = useCurrentScenarioValidation();
  const { isCreateDraftAvailable, ...loaderData } = useLoaderData<typeof loader>();

  const scenarioIterations = useScenarioIterations();

  const iterationId = useParam('iterationId');

  const { currentIteration, draftIteration } = React.useMemo(() => {
    const currentIteration = scenarioIterations.find(({ id }) => id === iterationId);
    const draftIteration = scenarioIterations.find(({ version }) => version === null);
    invariant(currentIteration, 'currentIteration is required');
    return { currentIteration, draftIteration };
  }, [iterationId, scenarioIterations]);

  const editorMode = useEditorMode();

  const withEditTag = editorMode === 'edit';
  const withCreateDraftIteration = isCreateDraftAvailable && currentIteration.type !== 'draft';

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <BreadCrumbs />

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
          {loaderData.isDeploymentActionsAvailable ? (
            <DeploymentActions
              scenario={{
                id: currentScenario.id,
                isLive: !!currentScenario.liveVersionId,
              }}
              iteration={{
                id: currentIteration.id,
                type: currentIteration.type,
                isValid:
                  !hasTriggerErrors(scenarioValidation) &&
                  !hasRulesErrors(scenarioValidation) &&
                  !hasDecisionErrors(scenarioValidation),
                status: loaderData.publicationPreparationStatus.status,
              }}
              isPreparationServiceOccupied={
                loaderData.publicationPreparationStatus.serviceStatus === 'occupied'
              }
            />
          ) : null}
        </div>
      </Page.Header>
      <Page.Container>
        {currentScenario.description ? (
          <Page.Description>{currentScenario.description}</Page.Description>
        ) : null}
        <Page.Content>
          <nav>
            <ul className="flex flex-row gap-2">
              <li>
                <TabLink
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
                <TabLink
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
                <TabLink
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
    </Page.Main>
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

function DeploymentActions({
  scenario,
  iteration,
  isPreparationServiceOccupied,
}: {
  scenario: {
    id: string;
    isLive: boolean;
  };
  iteration: {
    id: string;
    type: 'draft' | 'version' | 'live version';
    isValid: boolean;
    status: 'required' | 'ready_to_activate';
  };
  isPreparationServiceOccupied: boolean;
}) {
  switch (iteration.type) {
    case 'draft':
      return <CommitScenarioDraft scenarioId={scenario.id} iteration={iteration} />;
    case 'version':
      if (iteration.status === 'ready_to_activate') {
        return <ActivateScenarioVersion scenario={scenario} iteration={iteration} />;
      }
      return (
        <PrepareScenarioVersion
          scenarioId={scenario.id}
          iteration={iteration}
          isPreparationServiceOccupied={isPreparationServiceOccupied}
        />
      );
    case 'live version':
      return <DeactivateScenarioVersion scenarioId={scenario.id} iterationId={iteration.id} />;
    default:
      return null;
  }
}
