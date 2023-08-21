import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptScenarioIterationRuleDto,
  adaptScenarioIterationSummary,
  adaptScenarioIterationWithBody,
} from '@app-builder/models/scenario';

export type ScenarioRepository = ReturnType<typeof getScenarioRepository>;

export function getScenarioRepository() {
  return (marbleApiClient: MarbleApi) => ({
    getScenarioIterationRule: async ({ ruleId }: { ruleId: string }) => {
      const { rule } = await marbleApiClient.getScenarioIterationRule(ruleId);

      return adaptScenarioIterationRuleDto(rule);
    },
    getScenarioIteration: async ({ iterationId }: { iterationId: string }) => {
      const scenarioIteration = await marbleApiClient.getScenarioIteration(
        iterationId
      );
      return adaptScenarioIterationWithBody(scenarioIteration);
    },
    listScenarioIterations: async ({ scenarioId }: { scenarioId: string }) => {
      const dtos = await marbleApiClient.listScenarioIterations({ scenarioId });
      return dtos.map(adaptScenarioIterationSummary);
    },
  });
}
