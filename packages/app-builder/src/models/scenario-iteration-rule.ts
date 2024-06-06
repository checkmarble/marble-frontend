import {
  type CreateScenarioIterationRuleBodyDto,
  type ScenarioIterationRuleDto,
  type UpdateScenarioIterationRuleBodyDto,
} from 'marble-api';

import { adaptAstNode, adaptNodeDto, type AstNode } from './ast-node';

export interface ScenarioIterationRule {
  id: string;
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  ruleGroup?: string;
  formula: AstNode | null;
  scoreModifier: number;
  createdAt: string;
}

export function adaptScenarioIterationRule(
  dto: ScenarioIterationRuleDto,
): ScenarioIterationRule {
  return {
    id: dto.id,
    scenarioIterationId: dto.scenarioIterationId,
    displayOrder: dto.displayOrder,
    name: dto.name,
    description: dto.description,
    formula: dto.formula_ast_expression
      ? adaptAstNode(dto.formula_ast_expression)
      : null,
    scoreModifier: dto.scoreModifier,
    createdAt: dto.createdAt,
  };
}

export interface CreateScenarioIterationRuleInput {
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  formula: AstNode | null;
  scoreModifier: number;
}

export function adaptCreateScenarioIterationRuleBodyDto(
  input: CreateScenarioIterationRuleInput,
): CreateScenarioIterationRuleBodyDto {
  return {
    scenarioIterationId: input.scenarioIterationId,
    displayOrder: input.displayOrder,
    name: input.name,
    description: input.description,
    formula_ast_expression: input.formula ? adaptNodeDto(input.formula) : null,
    scoreModifier: input.scoreModifier,
  };
}

export interface UpdateScenarioIterationRuleInput {
  ruleId: string;
  displayOrder?: number;
  name?: string;
  description?: string;
  formula?: AstNode | null;
  scoreModifier?: number;
}

export function adaptUpdateScenarioIterationRuleBodyDto(
  input: UpdateScenarioIterationRuleInput,
): UpdateScenarioIterationRuleBodyDto {
  return {
    displayOrder: input.displayOrder,
    name: input.name,
    description: input.description,
    formula_ast_expression: input.formula
      ? adaptNodeDto(input.formula)
      : input.formula,
    scoreModifier: input.scoreModifier,
  };
}
