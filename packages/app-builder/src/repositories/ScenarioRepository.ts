import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptScenarioValidation } from '@app-builder/models';
import {
  adaptScenarioIteration,
  adaptScenarioIterationRule,
  adaptScenarioIterationSummary,
} from '@app-builder/models/scenario';

export type ScenarioRepository = ReturnType<typeof getScenarioRepository>;

export function getScenarioRepository() {
  return (marbleApiClient: MarbleApi) => ({
    getScenarioIterationRule: async ({ ruleId }: { ruleId: string }) => {
      const { rule } = await marbleApiClient.getScenarioIterationRule(ruleId);

      return adaptScenarioIterationRule(rule);
    },
    getScenarioIteration: async ({ iterationId }: { iterationId: string }) => {
      const scenarioIteration = await marbleApiClient.getScenarioIteration(
        iterationId
      );
      return adaptScenarioIteration(scenarioIteration);
    },
    listScenarioIterations: async ({ scenarioId }: { scenarioId: string }) => {
      const dtos = await marbleApiClient.listScenarioIterations({ scenarioId });
      return dtos.map(adaptScenarioIterationSummary);
    },
    validate: async ({ iterationId }: { iterationId: string }) => {
      const result = await marbleApiClient.validateScenarioIteration(
        iterationId
      );
      return adaptScenarioValidation(result.scenario_validation);
    },
  });
}
