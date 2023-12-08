import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptNodeDto,
  adaptScenarioValidation,
  type AstNode,
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
import { type Scenario } from 'marble-api';

export interface ScenarioRepository {
  listScenarios(): Promise<Scenario[]>;
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
  validateScenarioIterationTrigger(args: {
    iterationId: string;
    trigger: AstNode;
  }): Promise<ScenarioValidation['trigger']>;
}

export function getScenarioRepository() {
  return (marbleApiClient: MarbleApi): ScenarioRepository => ({
    listScenarios: async () => {
      const scenarios = await marbleApiClient.listScenarios();
      return scenarios;
    },
    getScenarioIterationRule: async ({ ruleId }) => {
      const { rule } = await marbleApiClient.getScenarioIterationRule(ruleId);

      return adaptScenarioIterationRule(rule);
    },
    getScenarioIteration: async ({ iterationId }) => {
      const scenarioIteration =
        await marbleApiClient.getScenarioIteration(iterationId);
      return adaptScenarioIteration(scenarioIteration);
    },
    listScenarioIterations: async ({ scenarioId }) => {
      const dtos = await marbleApiClient.listScenarioIterations({ scenarioId });
      return dtos.map(adaptScenarioIterationSummary);
    },
    validate: async ({ iterationId }) => {
      const result =
        await marbleApiClient.validateScenarioIteration(iterationId);
      return adaptScenarioValidation(result.scenario_validation);
    },
    validateScenarioIterationTrigger: async ({ iterationId, trigger }) => {
      const { scenario_validation } =
        await marbleApiClient.validateScenarioIterationWithGivenTriggerOrRule(
          iterationId,
          {
            trigger_or_rule: adaptNodeDto(trigger),
            rule_id: null,
          },
        );
      const scenarioValidation = adaptScenarioValidation(scenario_validation);
      return scenarioValidation.trigger;
    },
  });
}
