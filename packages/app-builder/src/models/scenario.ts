import { type ScenarioIterationRule as ScenarioIterationRuleDto, type ScenarioIterationWithBody } from '@marble-api';

import { adaptNodeDto, type AstNode,isOrAndGroup, wrapInOrAndGroups } from './ast-node';

export type ScenarioIterationRule = {
  id: string;
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  astNode: AstNode;
  scoreModifier: number;
  createdAt: string;
};

export interface ScenarioIteration {
  id: string;
  scenarioId: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
  scoreReviewThreshold?: number;
  scoreRejectThreshold?: number;
  rules: ScenarioIterationRule[];
  schedule?: string;
  astNode: AstNode;
}


export function adaptScenarioIterationRuleDto(scenarioIterationRuleDto: ScenarioIterationRuleDto): ScenarioIterationRule {
  let astNode: AstNode; 
  if (!scenarioIterationRuleDto.formula_ast_expression) {
    astNode = wrapInOrAndGroups();
  } else {
    const unwrappedAstNode = adaptNodeDto(
      scenarioIterationRuleDto.formula_ast_expression
    );
    astNode = isOrAndGroup(unwrappedAstNode)
    ? unwrappedAstNode
    : wrapInOrAndGroups(unwrappedAstNode);
  }
  return {
    id: scenarioIterationRuleDto.id,
    scenarioIterationId: scenarioIterationRuleDto.scenarioIterationId,
    displayOrder: scenarioIterationRuleDto.displayOrder,
    name: scenarioIterationRuleDto.name,
    description: scenarioIterationRuleDto.description,
    astNode: astNode,
    scoreModifier: scenarioIterationRuleDto.scoreModifier,
    createdAt: scenarioIterationRuleDto.createdAt,
  }
}


export function adaptScenarioIterationDto(scenarioIterationWithBody: ScenarioIterationWithBody): ScenarioIteration {
  let astNode: AstNode; 
  if (!scenarioIterationWithBody.body.trigger_condition_ast_expression) {
    astNode = wrapInOrAndGroups();
  } else {
    const unwrappedAstNode = adaptNodeDto(
      scenarioIterationWithBody.body.trigger_condition_ast_expression
    );
    astNode = isOrAndGroup(unwrappedAstNode)
    ? unwrappedAstNode
    : wrapInOrAndGroups(unwrappedAstNode);
  }
  return {
    id: scenarioIterationWithBody.id,
    scenarioId: scenarioIterationWithBody.scenarioId,
    version: scenarioIterationWithBody.version,
    createdAt: scenarioIterationWithBody.createdAt,
    updatedAt: scenarioIterationWithBody.updatedAt,
    scoreReviewThreshold: scenarioIterationWithBody.body.scoreReviewThreshold,
    scoreRejectThreshold: scenarioIterationWithBody.body.scoreRejectThreshold,
    rules: scenarioIterationWithBody.body.rules.map(adaptScenarioIterationRuleDto),
    schedule: scenarioIterationWithBody.body.schedule,
    astNode: astNode,
  }
}
