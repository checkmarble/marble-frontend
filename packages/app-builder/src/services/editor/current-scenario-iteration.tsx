import { type ScenarioIteration } from '@app-builder/models';
import { createSimpleContext } from '@app-builder/utils/create-context';

const CurrentScenarioIterationContext = createSimpleContext<ScenarioIteration>(
  'CurrentScenarioIterationContext'
);

export const CurrentScenarioIterationContextProvider =
  CurrentScenarioIterationContext.Provider;

export const useCurrentScenarioIteration =
  CurrentScenarioIterationContext.useValue;
