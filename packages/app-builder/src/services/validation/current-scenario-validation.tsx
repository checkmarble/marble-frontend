import { type ScenarioValidation } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useParam } from '@app-builder/utils/short-uuid';

import { findRuleValidation } from './scenario-validation';

const CurrentScenarioValidationContext =
  createSimpleContext<ScenarioValidation>('CurrentScenarioValidationContext');

export const CurrentScenarioValidationContextProvider =
  CurrentScenarioValidationContext.Provider;

export const useCurrentScenarioValidation =
  CurrentScenarioValidationContext.useValue;

export const useCurrentRuleValidationRule = () => {
  const ruleId = useParam('ruleId');
  const scenarioValidation = useCurrentScenarioValidation();
  return findRuleValidation(scenarioValidation, ruleId);
};
