import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type AstNode, adaptAstNode, adaptNodeDto } from '@app-builder/models';
import {
  adaptCreateScenarioIterationRuleBodyDto,
  adaptScenarioIterationRule,
  adaptUpdateScenarioIterationRuleBodyDto,
  type CreateScenarioIterationRuleInput,
  type ScenarioIterationRule,
  type UpdateScenarioIterationRuleInput,
} from '@app-builder/models/scenario/iteration-rule';

export async function listRules(
  api: MarbleCoreApi,
  args: { scenarioIterationId: string },
): Promise<ScenarioIterationRule[]> {
  const rules = await api.listScenarioIterationRules(args.scenarioIterationId);
  return rules.map(adaptScenarioIterationRule);
}

export async function getRule(api: MarbleCoreApi, { ruleId }: { ruleId: string }): Promise<ScenarioIterationRule> {
  const { rule } = await api.getScenarioIterationRule(ruleId);
  return adaptScenarioIterationRule(rule);
}

export async function createRule(
  api: MarbleCoreApi,
  args: CreateScenarioIterationRuleInput,
): Promise<ScenarioIterationRule> {
  const { rule } = await api.createScenarioIterationRule(adaptCreateScenarioIterationRuleBodyDto(args));
  return adaptScenarioIterationRule(rule);
}

export async function updateRule(
  api: MarbleCoreApi,
  args: UpdateScenarioIterationRuleInput,
): Promise<ScenarioIterationRule> {
  const { rule } = await api.updateScenarioIterationRule(args.ruleId, adaptUpdateScenarioIterationRuleBodyDto(args));
  return adaptScenarioIterationRule(rule);
}

export async function getRuleDescription(
  api: MarbleCoreApi,
  { scenarioId, astNode }: { scenarioId: string; astNode: AstNode },
): Promise<{ description: string; isRuleValid: boolean }> {
  const { description, is_rule_valid } = await api.generateAiDescriptionForAstExpression(scenarioId, {
    ast_expression: adaptNodeDto(astNode),
  });
  return { description, isRuleValid: is_rule_valid };
}

export async function generateRuleAst(
  api: MarbleCoreApi,
  { scenarioId, ruleId, instruction }: { scenarioId: string; ruleId: string; instruction: string },
): Promise<{ ruleAst: AstNode; validation: { isValid: boolean; errors: string[]; warnings: string[] } }> {
  const { rule_ast, validation } = await api.generateRuleAst(scenarioId, {
    rule_id: ruleId,
    instruction,
  });
  return {
    ruleAst: adaptAstNode(rule_ast),
    validation: { isValid: validation.is_valid, errors: validation.errors, warnings: validation.warnings },
  };
}
