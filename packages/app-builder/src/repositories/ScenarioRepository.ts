import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptScenarioValidation,
  type ScenarioValidation,
} from '@app-builder/models';
import {
  adaptScenarioIteration,
  adaptScenarioIterationRule,
  adaptScenarioIterationSummary,
  type ScenarioIteration,
  type ScenarioIterationRule,
  type ScenarioIterationSummary,
} from '@app-builder/models/scenario';

export interface ScenarioRepository {
  getScenarioIterationRule(args: {
    ruleId: string;
  }): Promise<ScenarioIterationRule>;
  getScenarioIteration(args: {
    iterationId: string;
  }): Promise<ScenarioIteration>;
  listScenarioIterations(args: {
    scenarioId: string;
  }): Promise<ScenarioIterationSummary[]>;
  validate(args: { iterationId: string }): Promise<ScenarioValidation>;
}

export function getScenarioRepository() {
  return (marbleApiClient: MarbleApi): ScenarioRepository => ({
    getScenarioIterationRule: async ({ ruleId }) => {
      const { rule } = await marbleApiClient.getScenarioIterationRule(ruleId);

      return adaptScenarioIterationRule(rule);
    },
    getScenarioIteration: async ({ iterationId }) => {
      const scenarioIteration = await marbleApiClient.getScenarioIteration(
        iterationId
      );
      return adaptScenarioIteration(scenarioIteration);
    },
    listScenarioIterations: async ({ scenarioId }) => {
      const dtos = await marbleApiClient.listScenarioIterations({ scenarioId });
      return dtos.map(adaptScenarioIterationSummary);
    },
    validate: async ({ iterationId }) => {
      const result = await marbleApiClient.validateScenarioIteration(
        iterationId
      );
      return adaptScenarioValidation(result.scenario_validation);
    },
  });
}
