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
  createScenario(args: {
    name: string;
    description: string;
    triggerObjectType: string;
  }): Promise<Scenario>;
  updateScenario(args: {
    scenarioId: string;
    name: string;
    description: string | null;
  }): Promise<Scenario>;
  createScenarioIteration(args: {
    scenarioId: string;
  }): Promise<ScenarioIteration>;
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
    createScenario: async (args) => {
      const scenario = await marbleApiClient.createScenario(args);
      return scenario;
    },
    updateScenario: async ({ scenarioId, name, description }) => {
      const scenario = await marbleApiClient.updateScenario(scenarioId, {
        name,
        description: description ?? '',
      });
      return scenario;
    },
    createScenarioIteration: async ({ scenarioId }) => {
      const scenarioIteration = await marbleApiClient.createScenarioIteration({
        scenarioId,
      });
      return adaptScenarioIteration(scenarioIteration);
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
