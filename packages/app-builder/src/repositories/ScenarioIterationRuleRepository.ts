import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { AstNode, adaptNodeDto } from '@app-builder/models';
import {
  adaptCreateScenarioIterationRuleBodyDto,
  adaptScenarioIterationRule,
  adaptUpdateScenarioIterationRuleBodyDto,
  type CreateScenarioIterationRuleInput,
  type ScenarioIterationRule,
  type UpdateScenarioIterationRuleInput,
} from '@app-builder/models/scenario/iteration-rule';

export interface ScenarioIterationRuleRepository {
  listRules(args: { scenarioIterationId?: string }): Promise<ScenarioIterationRule[]>;
  getRule(args: { ruleId: string }): Promise<ScenarioIterationRule>;
  createRule(args: CreateScenarioIterationRuleInput): Promise<ScenarioIterationRule>;
  updateRule(args: UpdateScenarioIterationRuleInput): Promise<ScenarioIterationRule>;
  deleteRule(args: { ruleId: string }): Promise<void>;
  getRuleDescription(args: { astNode: AstNode }): Promise<string>;
}

export function makeGetScenarioIterationRuleRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ScenarioIterationRuleRepository => ({
    listRules: async (args) => {
      const rules = await marbleCoreApiClient.listScenarioIterationRules(args);
      return rules.map(adaptScenarioIterationRule);
    },
    getRule: async ({ ruleId }) => {
      const { rule } = await marbleCoreApiClient.getScenarioIterationRule(ruleId);
      return adaptScenarioIterationRule(rule);
    },
    createRule: async (args) => {
      const { rule } = await marbleCoreApiClient.createScenarioIterationRule(
        adaptCreateScenarioIterationRuleBodyDto(args),
      );
      return adaptScenarioIterationRule(rule);
    },
    updateRule: async (args) => {
      const { rule } = await marbleCoreApiClient.updateScenarioIterationRule(
        args.ruleId,
        adaptUpdateScenarioIterationRuleBodyDto(args),
      );
      return adaptScenarioIterationRule(rule);
    },
    deleteRule: async ({ ruleId }) => {
      await marbleCoreApiClient.deleteScenarioIterationRule(ruleId);
    },
    getRuleDescription: async ({ astNode }) => {
      const { description } = await marbleCoreApiClient.generateAiDescriptionForAstExpression({
        ast_expression: adaptNodeDto(astNode),
      });
      return description;
    },
  });
}
