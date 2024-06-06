import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptCreateScenarioIterationRuleBodyDto,
  adaptScenarioIterationRule,
  adaptUpdateScenarioIterationRuleBodyDto,
  type CreateScenarioIterationRuleInput,
  type ScenarioIterationRule,
  type UpdateScenarioIterationRuleInput,
} from '@app-builder/models/scenario-iteration-rule';

export interface ScenarioIterationRuleRepository {
  listRules(args: {
    scenarioIterationId?: string;
  }): Promise<ScenarioIterationRule[]>;
  getRule(args: { ruleId: string }): Promise<ScenarioIterationRule>;
  createRule(
    args: CreateScenarioIterationRuleInput,
  ): Promise<ScenarioIterationRule>;
  updateRule(
    args: UpdateScenarioIterationRuleInput,
  ): Promise<ScenarioIterationRule>;
  deleteRule(args: { ruleId: string }): Promise<void>;
}

export function getScenarioIterationRuleRepository() {
  return (marbleApiClient: MarbleApi): ScenarioIterationRuleRepository => ({
    listRules: async (args) => {
      const rules = await marbleApiClient.listScenarioIterationRules(args);
      return rules.map(adaptScenarioIterationRule);
    },
    getRule: async ({ ruleId }) => {
      const { rule } = await marbleApiClient.getScenarioIterationRule(ruleId);
      return adaptScenarioIterationRule(rule);
    },
    createRule: async (args) => {
      const { rule } = await marbleApiClient.createScenarioIterationRule(
        adaptCreateScenarioIterationRuleBodyDto(args),
      );
      return adaptScenarioIterationRule(rule);
    },
    updateRule: async (args) => {
      const { rule } = await marbleApiClient.updateScenarioIterationRule(
        args.ruleId,
        adaptUpdateScenarioIterationRuleBodyDto(args),
      );
      return adaptScenarioIterationRule(rule);
    },
    deleteRule: async ({ ruleId }) => {
      await marbleApiClient.deleteScenarioIterationRule(ruleId);
    },
  });
}
