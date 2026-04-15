// All these hooks are meant to be used inside sub-route components

import { useLoaderData } from '@tanstack/react-router';
import { useMemo } from 'react';
import * as R from 'remeda';

export const useBuilderLayoutData = () => {
  return useLoaderData({
    from: '/_app/_builder',
  });
};

export const useDetectionScenarioData = () => {
  return useLoaderData({
    from: '/_app/_builder/detection/scenarios/$scenarioId',
  });
};

export const useDetectionScenarioIterationData = () => {
  return useLoaderData({
    from: '/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId',
  });
};

// Derived

export const useDerivedIterationRuleGroupsData = () => {
  const {
    rulesMetadata,
    scenarioIteration: { screeningConfigs },
  } = useDetectionScenarioIterationData();

  const configGroups = useMemo(
    () =>
      R.pipe(
        screeningConfigs,
        R.map((c) => c.ruleGroup),
        R.filter((group) => group !== undefined),
      ),
    [screeningConfigs],
  );

  return useMemo(
    () =>
      R.pipe(
        rulesMetadata,
        R.map((r) => r.ruleGroup),
        R.concat(configGroups),
        R.filter((val) => !R.isEmpty(val)),
        R.unique(),
      ),
    [rulesMetadata, configGroups],
  );
};
