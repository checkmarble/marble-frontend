import { navigationI18n, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { CornerPing } from '@app-builder/components/Ping';
import { ActivateScenarioVersion } from '@app-builder/components/Scenario/Iteration/Actions/ActivateScenarioVersion';
import { CommitIterationDraft } from '@app-builder/components/Scenario/Iteration/Actions/CommitIterationDraft';
import { CreateDraftIteration } from '@app-builder/components/Scenario/Iteration/Actions/CreateDraft';
import { DeactivateScenarioVersion } from '@app-builder/components/Scenario/Iteration/Actions/DeactivateScenarioVersion';
import { PrepareScenarioVersion } from '@app-builder/components/Scenario/Iteration/Actions/PrepareScenarioVersion';
import { ArchivedIterationView } from '@app-builder/components/Scenario/Iteration/ArchivedIterationView';
import {
  useCurrentScenario,
  useScenarioIterationsSummary,
} from '@app-builder/routes/_builder+/detection+/scenarios+/$scenarioId+/_layout';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { isCreateDraftAvailable, isDeploymentActionsAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import {
  hasDecisionErrors,
  hasRulesErrors,
  hasScreeningsErrors,
  hasTriggerErrors,
} from '@app-builder/services/validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { cn, Tabs, Tag, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useCurrentScenarioIteration, useCurrentScenarioValidation } from '../_layout';

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
  const { archived } = useCurrentScenarioIteration();

  const scenarioIterations = useScenarioIterationsSummary();

  const iterationId = useParam('iterationId');

  const { currentIteration, draftIteration } = React.useMemo(() => {
    const currentIteration = scenarioIterations.find(({ id }) => id === iterationId);
    const draftIteration = scenarioIterations.find(({ version }) => version === null);
    invariant(currentIteration, 'currentIteration is required');
    return { currentIteration, draftIteration };
  }, [iterationId, scenarioIterations]);

  const editorMode = useEditorMode();

  const withEditTag = editorMode === 'edit';
  const withCreateDraftIteration = isCreateDraftAvailable && currentIteration.type !== 'draft' && !archived;

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
        {!archived ? (
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
                    !hasScreeningsErrors(scenarioValidation) &&
                    !hasDecisionErrors(scenarioValidation),
                  status: loaderData.publicationPreparationStatus.status,
                }}
                isPreparationServiceOccupied={loaderData.publicationPreparationStatus.serviceStatus === 'occupied'}
              />
            ) : null}
          </div>
        ) : null}
      </Page.Header>
      <Page.Container>
        {archived ? (
          <aside className="bg-grey-background text-s text-grey-primary flex flex-row items-center gap-2 p-4 font-normal lg:px-8 lg:py-4">
            <Icon icon="tip" className="size-5 shrink-0" />
            {t('scenarios:iteration.archived_message')}
          </aside>
        ) : currentScenario.description ? (
          <Page.Description>{currentScenario.description}</Page.Description>
        ) : null}
        <Page.Content>
          {archived ? (
            <ArchivedIterationView />
          ) : (
            <>
              <Tabs>
                <NavLink
                  to="./trigger"
                  className={cn(tabClassName, 'gap-2')}
                  aria-invalid={hasTriggerErrors(scenarioValidation)}
                >
                  <ScenariosLinkIcon
                    icon="trigger"
                    withPing={hasTriggerErrors(scenarioValidation)}
                    className="size-5"
                  />
                  <span className="first-letter:capitalize">{t('navigation:scenario.trigger')}</span>
                </NavLink>
                <NavLink
                  to="./rules"
                  className={cn(tabClassName, 'gap-2')}
                  aria-invalid={hasRulesErrors(scenarioValidation)}
                >
                  <ScenariosLinkIcon icon="rules" withPing={hasRulesErrors(scenarioValidation)} className="size-5" />
                  <span className="first-letter:capitalize">{t('navigation:scenario.rules')}</span>
                </NavLink>
                <NavLink
                  to="./decision"
                  className={cn(tabClassName, 'gap-2')}
                  aria-invalid={hasDecisionErrors(scenarioValidation)}
                >
                  <ScenariosLinkIcon
                    icon="decision"
                    withPing={hasDecisionErrors(scenarioValidation)}
                    className="size-5"
                  />
                  <span className="first-letter:capitalize">{t('navigation:scenario.decision')}</span>
                </NavLink>
              </Tabs>
              <Outlet />
            </>
          )}
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
      return <CommitIterationDraft scenarioId={scenario.id} iteration={iteration} />;
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
