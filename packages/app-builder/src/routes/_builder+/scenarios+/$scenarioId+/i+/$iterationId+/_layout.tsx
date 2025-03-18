import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import {
  getFormattedLive,
  getFormattedVersion,
  ScenarioIterationMenu,
} from '@app-builder/components/Scenario/Iteration/ScenarioIterationMenu';
import { type ScenarioIterationWithType } from '@app-builder/models/scenario-iteration';
import {
  type EditorMode,
  EditorModeContextProvider,
} from '@app-builder/services/editor/editor-mode';
import { isEditScenarioAvailable } from '@app-builder/services/feature-access';
import { initServerServices } from '@app-builder/services/init.server';
import { findRuleValidation } from '@app-builder/services/validation';
import { formatDateRelative, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs, type SerializeFrom } from '@remix-run/node';
import { Outlet, useLoaderData, useLocation, useRouteLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import invariant from 'tiny-invariant';
import { MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { useScenarioIterations } from '../../_layout';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['scenarios']);
      const scenarioIterations = useScenarioIterations();
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
              scenarioId: fromUUID(currentIteration.scenarioId),
              iterationId: fromUUID(currentIteration.id),
            })}
          >
            <p className="text-s flex flex-row gap-1 font-semibold">
              <span className="capitalize">{currentFormattedVersion}</span>
              {currentFormattedLive ? (
                <span className="text-purple-65 capitalize">{currentFormattedLive}</span>
              ) : null}
            </p>
          </BreadCrumbLink>
        );
      }

      return (
        <VersionSelect
          currentIteration={currentIteration}
          scenarioIterations={scenarioIterations}
        />
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const iterationId = fromParams(params, 'iterationId');

  const [scenarioIteration, scenarioValidation] = await Promise.all([
    scenario.getScenarioIteration({
      iterationId,
    }),
    scenario.validate({
      iterationId,
    }),
  ]);

  const editorMode: EditorMode =
    isEditScenarioAvailable(user) && R.isNullish(scenarioIteration.version) ? 'edit' : 'view';

  return json({
    editorMode,
    scenarioIteration,
    scenarioValidation,
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

export function useCurrentScenarioIterationRule() {
  const ruleId = useParam('ruleId');
  const scenarioIteration = useCurrentScenarioIteration();

  const rule = scenarioIteration.rules.find((rule) => rule.id === ruleId);

  invariant(rule, `No rule corresponding to ${ruleId}`);

  return rule;
}

export const useRuleGroups = () => {
  const { rules, sanctionCheckConfig } = useCurrentScenarioIteration();

  return useMemo(
    () =>
      R.pipe(
        [
          ...rules.map((r) => r.ruleGroup),
          ...(sanctionCheckConfig?.ruleGroup ? [sanctionCheckConfig.ruleGroup] : []),
        ],
        R.filter((val) => !R.isEmpty(val)),
        R.unique(),
      ),
    [rules, sanctionCheckConfig],
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
        linkTo: location.pathname.replace(fromUUID(currentIteration.id), fromUUID(si.id)),
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
      <MenuButton className="text-s text-grey-00 border-grey-90 focus:border-purple-65 flex min-h-10 items-center justify-between rounded-full border p-2 font-medium outline-none">
        <p className="text-s ml-2 flex flex-row gap-1 font-semibold">
          <span className="text-grey-00 capitalize">{currentFormattedVersion}</span>
          {currentFormattedLive ? (
            <span className="text-purple-65 capitalize">{currentFormattedLive}</span>
          ) : null}
        </p>
        <Icon aria-hidden icon="arrow-2-down" className="text-grey-00 size-6 shrink-0" />
      </MenuButton>
    </ScenarioIterationMenu>
  );
}
