import {
  type ScenarioIterationDto,
  type ScenarioIterationRuleDto,
  type ScenarioIterationWithBodyDto,
  type ScenarioPublicationStatusDto,
} from 'marble-api';

import { adaptAstNode, type AstNode } from './ast-node';

export type ScenarioIterationRule = {
  id: string;
  scenarioIterationId: string;
  displayOrder: number;
  name: string;
  description: string;
  formula: AstNode | null;
  scoreModifier: number;
  createdAt: string;
};

export interface ScenarioIterationSummary {
  id: string;
  scenarioId: string;
  version: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioIteration {
  id: string;
  scenarioId: string;
  version: number | null;
  createdAt: string;
  updatedAt: string;
  scoreReviewThreshold?: number;
  scoreRejectThreshold?: number;
  rules: ScenarioIterationRule[];
  schedule?: string;
  trigger: AstNode | null;
}

export function adaptScenarioIterationRule(
  scenarioIterationRuleDto: ScenarioIterationRuleDto,
): ScenarioIterationRule {
  return {
    id: scenarioIterationRuleDto.id,
    scenarioIterationId: scenarioIterationRuleDto.scenarioIterationId,
    displayOrder: scenarioIterationRuleDto.displayOrder,
    name: scenarioIterationRuleDto.name,
    description: scenarioIterationRuleDto.description,
    formula:
      scenarioIterationRuleDto.formula_ast_expression === null
        ? null
        : adaptAstNode(scenarioIterationRuleDto.formula_ast_expression),
    scoreModifier: scenarioIterationRuleDto.scoreModifier,
    createdAt: scenarioIterationRuleDto.createdAt,
  };
}

export function adaptScenarioIteration(
  scenarioIterationWithBody: ScenarioIterationWithBodyDto,
): ScenarioIteration {
  const triggerDto =
    scenarioIterationWithBody.body.trigger_condition_ast_expression;

  return {
    id: scenarioIterationWithBody.id,
    scenarioId: scenarioIterationWithBody.scenarioId,
    version: scenarioIterationWithBody.version,
    createdAt: scenarioIterationWithBody.createdAt,
    updatedAt: scenarioIterationWithBody.updatedAt,
    scoreReviewThreshold: scenarioIterationWithBody.body.scoreReviewThreshold,
    scoreRejectThreshold: scenarioIterationWithBody.body.scoreRejectThreshold,
    rules: scenarioIterationWithBody.body.rules.map(adaptScenarioIterationRule),
    schedule: scenarioIterationWithBody.body.schedule,
    trigger: triggerDto ? adaptAstNode(triggerDto) : null,
  };
}

export function adaptScenarioIterationSummary(
  dto: ScenarioIterationDto,
): ScenarioIterationSummary {
  return {
    id: dto.id,
    scenarioId: dto.scenarioId,
    version: dto.version,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export interface ScenarioPublicationStatus {
  status: 'required' | 'ready_to_activate';
  serviceStatus: 'available' | 'occupied';
}

export function adaptScenarioPublicationStatus(
  dto: ScenarioPublicationStatusDto,
): ScenarioPublicationStatus {
  return {
    status: dto.preparation_status,
    serviceStatus: dto.preparation_service_status,
  };
}
