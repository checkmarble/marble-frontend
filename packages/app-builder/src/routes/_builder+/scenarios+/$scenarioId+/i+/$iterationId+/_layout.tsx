import {
  type EditorMode,
  EditorModeContextProvider,
} from '@app-builder/services/editor';
import { isEditScenarioAvailable } from '@app-builder/services/feature-access.server';
import { serverServices } from '@app-builder/services/init.server';
import { findRuleValidation } from '@app-builder/services/validation';
import { getRoute, type RouteID } from '@app-builder/utils/routes';
import { fromParams, useParam } from '@app-builder/utils/short-uuid';
import {
  json,
  type LoaderFunctionArgs,
  type SerializeFrom,
} from '@remix-run/node';
import { Outlet, useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import React from 'react';
import * as R from 'remeda';
import invariant from 'tiny-invariant';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
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
    isEditScenarioAvailable(user) && R.isNullish(scenarioIteration.version)
      ? 'edit'
      : 'view';

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
  const { rules } = useCurrentScenarioIteration();

  return React.useMemo(
    () =>
      R.pipe(
        rules,
        R.map((rule) => rule.ruleGroup),
        R.filter((val) => !R.isEmpty(val)),
        R.unique(),
      ),
    [rules],
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
