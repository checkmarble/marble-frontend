import { type ScenarioValidation } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';

const CurrentScenarioValidationContext =
  createSimpleContext<ScenarioValidation>('CurrentScenarioValidationContext');

export const CurrentScenarioValidationContextProvider =
  CurrentScenarioValidationContext.Provider;

export const useCurrentScenarioValidation =
  CurrentScenarioValidationContext.useValue;
