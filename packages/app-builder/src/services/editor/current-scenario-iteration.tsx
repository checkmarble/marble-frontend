import { type ScenarioIteration } from '@app-builder/models/scenario-iteration';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useParam } from '@app-builder/utils/short-uuid';
import invariant from 'tiny-invariant';

const CurrentScenarioIterationContext = createSimpleContext<ScenarioIteration>(
  'CurrentScenarioIterationContext',
);

export const CurrentScenarioIterationContextProvider =
  CurrentScenarioIterationContext.Provider;

export const useCurrentScenarioIteration =
  CurrentScenarioIterationContext.useValue;

export const useCurrentScenarioIterationRule = () => {
  const ruleId = useParam('ruleId');
  const scenarioIteration = useCurrentScenarioIteration();

  const rule = scenarioIteration.rules.find((rule) => rule.id === ruleId);

  invariant(rule, `No rule corresponding to ${ruleId}`);

  return rule;
};
