import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { AstNode, adaptAstNode, adaptNodeDto } from '@app-builder/models';
import {
  adaptCreateScenarioIterationRuleBodyDto,
  adaptScenarioIterationRule,
  adaptScenarioIterationRuleMetadata,
  adaptUpdateScenarioIterationRuleBodyDto,
  type CreateScenarioIterationRuleInput,
  type ScenarioIterationRule,
  type ScenarioIterationRuleMetadata,
  type UpdateScenarioIterationRuleInput,
} from '@app-builder/models/scenario/iteration-rule';

export interface ScenarioIterationRuleRepository {
  listRules(args: { scenarioIterationId: string }): Promise<ScenarioIterationRule[]>;
  listRulesMetadata(args: { scenarioIterationId?: string }): Promise<ScenarioIterationRuleMetadata[]>;
  getRule(args: { ruleId: string }): Promise<ScenarioIterationRule>;
  createRule(args: CreateScenarioIterationRuleInput): Promise<ScenarioIterationRule>;
  updateRule(args: UpdateScenarioIterationRuleInput): Promise<ScenarioIterationRule>;
  deleteRule(args: { ruleId: string }): Promise<void>;
  getRuleDescription(args: {
    scenarioId: string;
    astNode: AstNode;
  }): Promise<{ description: string; isRuleValid: boolean }>;
  generateRuleAst(args: {
    scenarioId: string;
    ruleId: string;
    instruction: string;
  }): Promise<{ ruleAst: AstNode; validation: { isValid: boolean; errors: string[]; warnings: string[] } }>;
}

export function makeGetScenarioIterationRuleRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ScenarioIterationRuleRepository => ({
    listRules: async (args) => {
      const rules = await marbleCoreApiClient.listScenarioIterationRules(args.scenarioIterationId);
      return rules.map(adaptScenarioIterationRule);
    },
    listRulesMetadata: async (args) => {
      const rules = await marbleCoreApiClient.listScenarioIterationRulesMetadata(args);
      return rules.map(adaptScenarioIterationRuleMetadata);
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
    getRuleDescription: async ({ scenarioId, astNode }) => {
      const { description, is_rule_valid } = await marbleCoreApiClient.generateAiDescriptionForAstExpression(
        scenarioId,
        {
          ast_expression: adaptNodeDto(astNode),
        },
      );
      return { description, isRuleValid: is_rule_valid };
    },
    generateRuleAst: async ({ scenarioId, ruleId, instruction }) => {
      const { rule_ast, validation } = await marbleCoreApiClient.generateRuleAst(scenarioId, {
        rule_id: ruleId,
        instruction,
      });
      return {
        ruleAst: adaptAstNode(rule_ast),
        validation: { isValid: validation.is_valid, errors: validation.errors, warnings: validation.warnings },
      };
    },
  });
}
