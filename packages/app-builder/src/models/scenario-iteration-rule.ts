import {
  type CreateScenarioIterationRuleBodyDto,
  type ScenarioIterationRuleDto,
  type UpdateScenarioIterationRuleBodyDto,
} from 'marble-api';

import { adaptAstNode, adaptNodeDto, type AstNode } from './astNode/ast-node';

export interface ScenarioIterationRule {
  id: string;
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  ruleGroup: string;
  formula: AstNode | null;
  scoreModifier: number;
  createdAt: string;
}

export function adaptScenarioIterationRule(dto: ScenarioIterationRuleDto): ScenarioIterationRule {
  return {
    id: dto.id,
    scenarioIterationId: dto.scenario_iteration_id,
    displayOrder: dto.display_order,
    name: dto.name,
    description: dto.description,
    ruleGroup: dto.rule_group,
    formula: dto.formula_ast_expression ? adaptAstNode(dto.formula_ast_expression) : null,
    scoreModifier: dto.score_modifier,
    createdAt: dto.created_at,
  };
}

export interface CreateScenarioIterationRuleInput {
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  ruleGroup: string;
  formula: AstNode | null;
  scoreModifier: number;
}

export function adaptCreateScenarioIterationRuleBodyDto(
  input: CreateScenarioIterationRuleInput,
): CreateScenarioIterationRuleBodyDto {
  return {
    scenario_iteration_id: input.scenarioIterationId,
    display_order: input.displayOrder,
    name: input.name,
    description: input.description,
    rule_group: input.ruleGroup,
    formula_ast_expression: input.formula ? adaptNodeDto(input.formula) : null,
    score_modifier: input.scoreModifier,
  };
}

export interface UpdateScenarioIterationRuleInput {
  ruleId: string;
  displayOrder?: number;
  name?: string;
  description?: string;
  ruleGroup?: string;
  formula?: AstNode | null;
  scoreModifier?: number;
}

export function adaptUpdateScenarioIterationRuleBodyDto(
  input: UpdateScenarioIterationRuleInput,
): UpdateScenarioIterationRuleBodyDto {
  return {
    display_order: input.displayOrder,
    name: input.name,
    description: input.description,
    rule_group: input.ruleGroup,
    formula_ast_expression: input.formula ? adaptNodeDto(input.formula) : input.formula,
    score_modifier: input.scoreModifier,
  };
}
