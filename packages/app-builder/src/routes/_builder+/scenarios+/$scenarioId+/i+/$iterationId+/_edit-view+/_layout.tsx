import { navigationI18n, Page, TabLink } from '@app-builder/components';
import { CornerPing } from '@app-builder/components/Ping';
import {
  getFormattedLive,
  getFormattedVersion,
  ScenarioIterationMenu,
} from '@app-builder/components/Scenario/Iteration/ScenarioIterationMenu';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import {
  useCurrentScenario,
  useScenarioIterations,
} from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { ActivateScenarioVersion } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/activate';
import { CommitScenarioDraft } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/commit';
import { CreateDraftIteration } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/create_draft';
import { DeactivateScenarioVersion } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/deactivate';
import { PrepareScenarioVersion } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/prepare';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  hasDecisionErrors,
  hasRulesErrors,
  hasTriggerErrors,
} from '@app-builder/services/validation';
import {
  formatDateRelative,
  useFormatLanguage,
} from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import invariant from 'tiny-invariant';
import { MenuButton, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useCurrentScenarioValidation } from '../_layout';

export const handle = {
  i18n: [...navigationI18n, 'scenarios', 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService, featureAccessService } = serverServices;
  const { scenario, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const iterationId = fromParams(params, 'iterationId');

  const isDeploymentActionsAvailable =
    featureAccessService.isDeploymentActionsAvailable(user);
  const isCreateDraftAvailable =
    featureAccessService.isCreateDraftAvailable(user);
  if (!isDeploymentActionsAvailable) {
    return json({
      isDeploymentActionsAvailable: false as const,
      isCreateDraftAvailable,
    });
  }

  const publicationPreparationStatus =
    await scenario.getPublicationPreparationStatus({
      iterationId,
    });

  return json({
    isDeploymentActionsAvailable: true as const,
    isCreateDraftAvailable,
    publicationPreparationStatus,
  });
}

export default function ScenarioEditLayout() {
  const { t } = useTranslation(handle.i18n);
  const currentScenario = useCurrentScenario();
  const scenarioValidation = useCurrentScenarioValidation();
  const { isCreateDraftAvailable, ...loaderData } =
    useLoaderData<typeof loader>();

  const scenarioIterations = useScenarioIterations();

  const iterationId = useParam('iterationId');

  const { currentIteration, draftIteration } = React.useMemo(() => {
    const currentIteration = scenarioIterations.find(
      ({ id }) => id === iterationId,
    );
    const draftIteration = scenarioIterations.find(
      ({ version }) => version === null,
    );
    invariant(currentIteration, 'currentIteration is required');
    return { currentIteration, draftIteration };
  }, [iterationId, scenarioIterations]);

  const editorMode = useEditorMode();

  const withEditTag = editorMode === 'edit';
  const withCreateDraftIteration =
    isCreateDraftAvailable && currentIteration.type !== 'draft';

  return (
    <Page.Main>
      <Page.Header className="justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <Page.BackLink
            to={getRoute('/scenarios/:scenarioId/home', {
              scenarioId: fromUUID(currentScenario.id),
            })}
          />
          <p className="line-clamp-2 text-start">{currentScenario.name}</p>
          <VersionSelect
            currentIteration={currentIteration}
            scenarioIterations={scenarioIterations}
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
                loaderData.publicationPreparationStatus.serviceStatus ===
                'occupied'
              }
            />
          ) : null}
        </div>
      </Page.Header>
      <Page.Container>
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

function VersionSelect({
  currentIteration,
  scenarioIterations,
}: {
  currentIteration: ScenarioIterationWithType;
  scenarioIterations: ScenarioIterationWithType[];
}) {
  const { t } = useTranslation(['scenarios']);
  const location = useLocation();
  const language = useFormatLanguage();

  const labelledScenarioIteration = React.useMemo(
    () =>
      scenarioIterations.map((si) => ({
        id: si.id,
        type: si.type,
        version: si.version,
        updatedAt: si.updatedAt,
        linkTo: location.pathname.replace(
          fromUUID(currentIteration.id),
          fromUUID(si.id),
        ),
        formattedVersion: getFormattedVersion(si, t),
        formattedLive: getFormattedLive(si, t),
        formattedUpdatedAt: formatDateRelative(si.updatedAt, {
          language,
        }),
      })),
    [currentIteration.id, language, location.pathname, scenarioIterations, t],
  );

  const currentFormattedVersion = getFormattedVersion(currentIteration, t);
  const currentFormattedLive = getFormattedLive(currentIteration, t);

  return (
    <ScenarioIterationMenu
      labelledScenarioIteration={labelledScenarioIteration}
    >
      <MenuButton className="text-s text-grey-100 border-grey-10 flex min-h-10 items-center justify-between rounded-full border p-2 font-medium outline-none focus:border-purple-100">
        <p className="text-s ml-2 flex flex-row gap-1 font-semibold">
          <span className="text-grey-100 capitalize">
            {currentFormattedVersion}
          </span>
          {currentFormattedLive ? (
            <span className="capitalize text-purple-100">
              {currentFormattedLive}
            </span>
          ) : null}
        </p>
        <Icon
          aria-hidden
          icon="arrow-2-down"
          className="text-grey-100 size-6 shrink-0"
        />
      </MenuButton>
    </ScenarioIterationMenu>
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
      return (
        <CommitScenarioDraft scenarioId={scenario.id} iteration={iteration} />
      );
    case 'version':
      if (iteration.status === 'ready_to_activate') {
        return (
          <ActivateScenarioVersion scenario={scenario} iteration={iteration} />
        );
      }
      return (
        <PrepareScenarioVersion
          scenarioId={scenario.id}
          iteration={iteration}
          isPreparationServiceOccupied={isPreparationServiceOccupied}
        />
      );
    case 'live version':
      return (
        <DeactivateScenarioVersion
          scenarioId={scenario.id}
          iterationId={iteration.id}
        />
      );
    default:
      return null;
  }
}
