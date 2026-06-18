import { Callout, navigationI18n, Page } from '@app-builder/components';
import { CornerPing } from '@app-builder/components/Ping';
import { CreateDraftIteration } from '@app-builder/components/Scenario/Iteration/Actions/CreateDraft';
import { DeactivateScenarioVersion } from '@app-builder/components/Scenario/Iteration/Actions/DeactivateScenarioVersion';
import { ScenarioDeploymentModal } from '@app-builder/components/Scenario/Iteration/Actions/ScenarioDeploymentModal';
import { ArchivedIterationView } from '@app-builder/components/Scenario/Iteration/ArchivedIterationView';
import { ScenarioHeader } from '@app-builder/components/Scenario/ScenarioHeader';
import { useDetectionScenarioData, useDetectionScenarioIterationData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import {
  isCreateDraftAvailable,
  isDeploymentActionsAvailable,
  isEditScenarioAvailable,
} from '@app-builder/services/feature-access';
import {
  hasDecisionErrors,
  hasRulesErrors,
  hasScreeningsErrors,
  hasTriggerErrors,
} from '@app-builder/services/validation';
import { fromParams, useParam } from '@app-builder/utils/short-uuid';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { cn, Tabs, Tag, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { VersionSelect } from '../$iterationId';

const editViewLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function editViewLoader({ data, context }) {
    const { scenario, user } = context.authInfo;

    const iterationId = fromParams(data?.params ?? {}, 'iterationId');

    if (!isDeploymentActionsAvailable(user)) {
      return {
        isEditScenarioAvailable: isEditScenarioAvailable(user),
        isDeploymentActionsAvailable: false as const,
        isCreateDraftAvailable: isCreateDraftAvailable(user),
      };
    }

    const publicationPreparationStatus = await scenario.getPublicationPreparationStatus({ iterationId });

    return {
      isEditScenarioAvailable: isEditScenarioAvailable(user),
      isDeploymentActionsAvailable: true as const,
      isCreateDraftAvailable: isCreateDraftAvailable(user),
      publicationPreparationStatus,
    };
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view')({
  loader: ({ params }) => editViewLoader({ data: { params } }),
  component: ScenarioEditLayout,
});

function ScenarioEditLayout() {
  const { t } = useTranslation([...navigationI18n, 'scenarios', 'common']);
  const iterationId = useParam('iterationId');

  const { scenarioIterations, currentScenario } = useDetectionScenarioData();
  const { scenarioValidation, scenarioIteration, rulesMetadata } = useDetectionScenarioIterationData();
  const { isEditScenarioAvailable, isCreateDraftAvailable, ...loaderData } = Route.useLoaderData();

  const { currentIteration, draftIteration } = React.useMemo(() => {
    const currentIteration = scenarioIterations.find(({ id }) => id === iterationId);
    const draftIteration = scenarioIterations.find(({ version }) => version === null);
    invariant(currentIteration, 'currentIteration is required');
    return { currentIteration, draftIteration };
  }, [iterationId, scenarioIterations]);

  const editorMode = useEditorMode();

  const withEditTag = editorMode === 'edit';
  const withCreateDraftIteration =
    isCreateDraftAvailable && currentIteration.type !== 'draft' && !scenarioIteration.archived;

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-md">
        <div className="flex flex-row items-center gap-md">
          <ScenarioHeader isEditScenarioAvailable={isEditScenarioAvailable} scenario={currentScenario} />
          <VersionSelect currentIteration={currentIteration} scenarioIterations={scenarioIterations} />
          {withEditTag ? <Tag size="big">{t('common:edit')}</Tag> : null}
        </div>
      </Page.Header>
      <Page.ContentV2 className="flex flex-col gap-lg max-w-(--breakpoint-xl)">
        {scenarioIteration.archived ? (
          <Callout color="red" icon="warning" className="mb-md">
            {t('scenarios:iteration.archived_message')}
          </Callout>
        ) : (
          <section className="flex flex-row gap-lg items-center">
            {currentScenario.description ? (
              <Page.Description withIcon={false} className="flex-1">
                {currentScenario.description}
              </Page.Description>
            ) : null}

            <div className="flex flex-row items-center gap-md">
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
          </section>
        )}

        {scenarioIteration.archived ? (
          <ArchivedIterationView rulesMetadata={rulesMetadata} scenarioIteration={scenarioIteration} />
        ) : (
          <>
            <Tabs>
              <Link
                from="/detection/scenarios/$scenarioId/i/$iterationId"
                to="./trigger"
                className={cn(tabClassName, 'gap-sm')}
                aria-invalid={hasTriggerErrors(scenarioValidation)}
              >
                <ScenariosLinkIcon icon="trigger" withPing={hasTriggerErrors(scenarioValidation)} className="size-5" />
                <span className="first-letter:capitalize">{t('navigation:scenario.trigger')}</span>
              </Link>
              <Link
                from="/detection/scenarios/$scenarioId/i/$iterationId"
                to="./rules"
                className={cn(tabClassName, 'gap-sm')}
                aria-invalid={hasRulesErrors(scenarioValidation)}
              >
                <ScenariosLinkIcon icon="rules" withPing={hasRulesErrors(scenarioValidation)} className="size-5" />
                <span className="first-letter:capitalize">{t('navigation:scenario.rules')}</span>
              </Link>
              <Link
                from="/detection/scenarios/$scenarioId/i/$iterationId"
                to="./decision"
                className={cn(tabClassName, 'gap-sm')}
                aria-invalid={hasDecisionErrors(scenarioValidation)}
              >
                <ScenariosLinkIcon
                  icon="decision"
                  withPing={hasDecisionErrors(scenarioValidation)}
                  className="size-5"
                />
                <span className="first-letter:capitalize">{t('navigation:scenario.decision')}</span>
              </Link>
            </Tabs>
            <Outlet />
          </>
        )}
      </Page.ContentV2>
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
  const { rulesMetadata } = useDetectionScenarioIterationData();

  if (iteration.type === 'live version')
    return <DeactivateScenarioVersion scenarioId={scenario.id} iterationId={iteration.id} />;

  return (
    <ScenarioDeploymentModal
      scenario={scenario}
      iteration={iteration}
      isPreparationServiceOccupied={isPreparationServiceOccupied}
      rulesMetadata={rulesMetadata}
    />
  );
}
