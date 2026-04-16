import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import {
  getFormattedArchived,
  getFormattedLive,
  getFormattedVersion,
  ScenarioIterationMenu,
} from '@app-builder/components/Scenario/Iteration/ScenarioIterationMenu';
import { useDetectionScenarioData, useDetectionScenarioIterationData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type ScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { EditorMode, EditorModeContextProvider } from '@app-builder/services/editor/editor-mode';
import { isEditScenarioAvailable } from '@app-builder/services/feature-access';
import { findRuleValidation } from '@app-builder/services/validation';
import { formatDateRelative, useFormatLanguage } from '@app-builder/utils/format';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { createFileRoute, Outlet, useLoaderData, useLocation } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNullish } from 'remeda';
import invariant from 'tiny-invariant';
import { MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';

const iterationLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function iterationLayoutLoader({ data, context }) {
    const { scenarioIterationRuleRepository, scenario, user } = context.authInfo;

    const iterationId = fromParams(data?.params ?? {}, 'iterationId');

    const [scenarioIteration, scenarioValidation, rulesMetadata] = await Promise.all([
      scenario.getScenarioIterationWithoutRules({ iterationId }),
      scenario.validate({ iterationId }),
      scenarioIterationRuleRepository.listRulesMetadata({ scenarioIterationId: iterationId }),
    ]);

    const editorMode: EditorMode =
      isEditScenarioAvailable(user) && isNullish(scenarioIteration.version) && !scenarioIteration.archived
        ? 'edit'
        : 'view';

    return {
      editorMode,
      scenarioIteration,
      scenarioValidation,
      rulesMetadata,
    };
  });

export const useCurrentRuleValidationRule = () => {
  const ruleId = useParam('ruleId');
  const { scenarioValidation } = useDetectionScenarioIterationData();
  return findRuleValidation(scenarioValidation, ruleId);
};

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId')({
  loader: ({ params }) => iterationLayoutLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['scenarios']);
        const { scenarioIterations } = useLoaderData({
          from: '/_app/_builder/detection/scenarios/$scenarioId',
        });
        const iterationId = useParam('iterationId');

        const currentIteration = React.useMemo(() => {
          const currentIteration = scenarioIterations.find(({ id }) => id === iterationId);
          invariant(currentIteration, 'currentIteration is required');
          return currentIteration;
        }, [iterationId, scenarioIterations]);

        const currentFormattedVersion = getFormattedVersion(currentIteration, t);
        const currentFormattedLive = getFormattedLive(currentIteration, t);
        const currentFormattedArchived = getFormattedArchived(currentIteration, t);

        if (!isLast) {
          return (
            <BreadCrumbLink
              isLast={isLast}
              to="/detection/scenarios/$scenarioId/i/$iterationId"
              params={{
                scenarioId: fromUUIDtoSUUID(currentIteration.scenarioId),
                iterationId: fromUUIDtoSUUID(currentIteration.id),
              }}
            >
              <p className="text-s flex flex-row gap-1 font-semibold">
                <span className="capitalize">{currentFormattedVersion}</span>
                {currentFormattedLive ? (
                  <span className="text-purple-primary capitalize">{currentFormattedLive}</span>
                ) : null}
                {currentFormattedArchived ? (
                  <span className="text-grey-secondary capitalize">{currentFormattedArchived}</span>
                ) : null}
              </p>
            </BreadCrumbLink>
          );
        }

        return <VersionSelect currentIteration={currentIteration} scenarioIterations={scenarioIterations} />;
      },
    ],
  },
  component: CurrentScenarioIterationProvider,
});

function CurrentScenarioIterationProvider() {
  const { editorMode, scenarioIteration } = Route.useLoaderData();

  return (
    <EditorModeContextProvider value={editorMode}>
      <Outlet key={scenarioIteration.id} />
    </EditorModeContextProvider>
  );
}

export function VersionSelect({
  currentIteration,
  scenarioIterations,
}: {
  currentIteration: ScenarioIterationSummaryWithType;
  scenarioIterations: ScenarioIterationSummaryWithType[];
}) {
  const { t } = useTranslation(['scenarios']);
  const location = useLocation();
  const language = useFormatLanguage();
  const { currentScenario } = useDetectionScenarioData();

  const labelledScenarioIteration = React.useMemo(
    () =>
      scenarioIterations.map((si) => ({
        id: si.id,
        type: si.type,
        version: si.version,
        updatedAt: si.updatedAt,
        linkTo: location.pathname.replace(fromUUIDtoSUUID(currentIteration.id), fromUUIDtoSUUID(si.id)),
        formattedVersion: getFormattedVersion(si, t),
        formattedLive: getFormattedLive(si, t),
        formattedArchived: getFormattedArchived(si, t),
        formattedUpdatedAt: formatDateRelative(si.updatedAt, {
          language,
        }),
      })),
    [currentIteration.id, language, location.pathname, scenarioIterations, t],
  );

  const currentFormattedVersion = getFormattedVersion(currentIteration, t);
  const currentFormattedLive = getFormattedLive(currentIteration, t);
  const currentFormattedArchived = getFormattedArchived(currentIteration, t);

  return (
    <ScenarioIterationMenu labelledScenarioIteration={labelledScenarioIteration} scenario={currentScenario}>
      <MenuButton className="text-s text-purple-primary border-purple-border focus:border-purple-primary flex items-center rounded-full border py-v2-xs px-v2-sm gap-v2-xs outline-hidden font-normal">
        <p className="flex gap-1">
          <span className="capitalize">{currentFormattedVersion}</span>
          {currentFormattedLive ? (
            <span className="text-purple-primary capitalize font-bold">{currentFormattedLive}</span>
          ) : null}
          {currentFormattedArchived ? (
            <span className="text-grey-secondary capitalize">{currentFormattedArchived}</span>
          ) : null}
        </p>
        <Icon aria-hidden icon="caret-down" className="size-6 shrink-0" />
      </MenuButton>
    </ScenarioIterationMenu>
  );
}
