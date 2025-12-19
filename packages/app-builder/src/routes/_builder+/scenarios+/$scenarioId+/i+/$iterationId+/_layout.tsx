import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import {
  getFormattedLive,
  getFormattedVersion,
  ScenarioIterationMenu,
} from '@app-builder/components/Scenario/Iteration/ScenarioIterationMenu';
import { type ScenarioIterationSummaryWithType } from '@app-builder/models/scenario/iteration';
import { EditorMode, EditorModeContextProvider } from '@app-builder/services/editor/editor-mode';
import { isEditScenarioAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { findRuleValidation } from '@app-builder/services/validation';
import { formatDateRelative, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation, useRouteLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { concat, filter, isEmpty, isNullish, map, pipe, unique } from 'remeda';
import invariant from 'tiny-invariant';
import { MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useScenarioIterationsSummary } from '../../_layout';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['scenarios']);
      const scenarioIterations = useScenarioIterationsSummary();
      const iterationId = useParam('iterationId');

      const currentIteration = React.useMemo(() => {
        const currentIteration = scenarioIterations.find(({ id }) => id === iterationId);
        invariant(currentIteration, 'currentIteration is required');
        return currentIteration;
      }, [iterationId, scenarioIterations]);

      const currentFormattedVersion = getFormattedVersion(currentIteration, t);
      const currentFormattedLive = getFormattedLive(currentIteration, t);

      if (!isLast) {
        return (
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/scenarios/:scenarioId/i/:iterationId', {
              scenarioId: fromUUIDtoSUUID(currentIteration.scenarioId),
              iterationId: fromUUIDtoSUUID(currentIteration.id),
            })}
          >
            <p className="text-s flex flex-row gap-1 font-semibold">
              <span className="capitalize">{currentFormattedVersion}</span>
              {currentFormattedLive ? (
                <span className="text-purple-primary capitalize">{currentFormattedLive}</span>
              ) : null}
            </p>
          </BreadCrumbLink>
        );
      }

      return <VersionSelect currentIteration={currentIteration} scenarioIterations={scenarioIterations} />;
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenario, scenarioIterationRuleRepository, user } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const iterationId = fromParams(params, 'iterationId');

  const [scenarioIteration, scenarioValidation, rulesMetadata] = await Promise.all([
    scenario.getScenarioIterationWithoutRules({
      iterationId,
    }),
    scenario.validate({
      iterationId,
    }),
    scenarioIterationRuleRepository.listRulesMetadata({
      scenarioIterationId: iterationId,
    }),
  ]);

  const editorMode: EditorMode =
    isEditScenarioAvailable(user) && isNullish(scenarioIteration.version) ? 'edit' : 'view';

  return json({
    editorMode,
    scenarioIteration,
    scenarioValidation,
    rulesMetadata,
  });
}

export default function CurrentScenarioIterationProvider() {
  const { editorMode, scenarioIteration } = useLoaderData<typeof loader>();

  return (
    <EditorModeContextProvider value={editorMode}>
      <Outlet key={scenarioIteration.id} />
    </EditorModeContextProvider>
  );
}

function useCurrentScenarioIterationData() {
  return useRouteLoaderData(
    'routes/_builder+/scenarios+/$scenarioId+/i+/$iterationId+/_layout' satisfies RouteID,
  ) as SerializeFrom<typeof loader>;
}

export function useCurrentScenarioIteration() {
  const { scenarioIteration } = useCurrentScenarioIterationData();
  return scenarioIteration;
}

export function useScenarioIterationRulesMetadata() {
  const { rulesMetadata } = useCurrentScenarioIterationData();
  return rulesMetadata;
}

export const useRuleGroups = () => {
  const rulesMetadata = useScenarioIterationRulesMetadata();
  const { screeningConfigs } = useCurrentScenarioIteration();

  const configGroups = useMemo(
    () =>
      pipe(
        screeningConfigs,
        map((c) => c.ruleGroup),
        filter((group) => group !== undefined),
      ),
    [screeningConfigs],
  );

  return useMemo(
    () =>
      pipe(
        rulesMetadata,
        map((r) => r.ruleGroup),
        concat(configGroups),
        filter((val) => !isEmpty(val)),
        unique(),
      ),
    [rulesMetadata, configGroups],
  );
};

export function useCurrentScenarioValidation() {
  const { scenarioValidation } = useCurrentScenarioIterationData();
  return scenarioValidation;
}

export const useCurrentRuleValidationRule = () => {
  const ruleId = useParam('ruleId');
  const scenarioValidation = useCurrentScenarioValidation();
  return findRuleValidation(scenarioValidation, ruleId);
};

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
        formattedUpdatedAt: formatDateRelative(si.updatedAt, {
          language,
        }),
      })),
    [currentIteration.id, language, location.pathname, scenarioIterations, t],
  );

  const currentFormattedVersion = getFormattedVersion(currentIteration, t);
  const currentFormattedLive = getFormattedLive(currentIteration, t);

  return (
    <ScenarioIterationMenu labelledScenarioIteration={labelledScenarioIteration}>
      <MenuButton className="text-s text-grey-primary border-grey-border focus:border-purple-primary flex min-h-10 items-center justify-between rounded-full border p-2 font-medium outline-hidden">
        <p className="text-s ml-2 flex flex-row gap-1 font-semibold">
          <span className="text-grey-primary capitalize">{currentFormattedVersion}</span>
          {currentFormattedLive ? <span className="text-purple-primary capitalize">{currentFormattedLive}</span> : null}
        </p>
        <Icon aria-hidden icon="arrow-2-down" className="text-grey-primary size-6 shrink-0" />
      </MenuButton>
    </ScenarioIterationMenu>
  );
}
