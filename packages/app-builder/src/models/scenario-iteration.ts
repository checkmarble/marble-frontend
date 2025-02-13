import {
  type ScenarioIterationDto,
  type ScenarioIterationWithBodyDto,
  type UpdateScenarioIterationBody as UpdateScenarioIterationBodyDto,
} from 'marble-api';

import { adaptAstNode, adaptNodeDto, type AstNode } from './astNode/ast-node';
import {
  adaptSanctionCheckConfig,
  type SanctionCheckConfig,
} from './sanction-check-config';
import {
  adaptScenarioIterationRule,
  type ScenarioIterationRule,
} from './scenario-iteration-rule';

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
  scoreBlockAndReviewThreshold?: number;
  scoreDeclineThreshold?: number;
  rules: ScenarioIterationRule[];
  schedule?: string;
  trigger: AstNode | null;
  sanctionCheckConfig: SanctionCheckConfig | null;
}

export interface ScenarioIterationWithType extends ScenarioIteration {
  type: 'draft' | 'version' | 'live version';
}

export function adaptScenarioIterationWithType(
  scenarioIteration: ScenarioIteration,
  liveVersionId?: string,
): ScenarioIterationWithType {
  return {
    ...scenarioIteration,
    type:
      scenarioIteration.id === liveVersionId
        ? 'live version'
        : scenarioIteration.version
          ? 'version'
          : 'draft',
  };
}

export interface UpdateScenarioIterationBody {
  triggerConditionAstExpression?: AstNode | null;
  scoreReviewThreshold?: number;
  scoreBlockAndReviewThreshold?: number;
  scoreDeclineThreshold?: number;
  schedule?: string;
}

export function adaptUpdateScenarioIterationBody(
  input: UpdateScenarioIterationBody,
): UpdateScenarioIterationBodyDto {
  return {
    body: {
      trigger_condition_ast_expression: input.triggerConditionAstExpression
        ? adaptNodeDto(input.triggerConditionAstExpression)
        : null,
      score_review_threshold: input.scoreReviewThreshold,
      score_block_and_review_threshold: input.scoreBlockAndReviewThreshold,
      score_decline_threshold: input.scoreDeclineThreshold,
      schedule: input.schedule,
    },
  };
}

export function adaptScenarioIteration(
  scenarioIterationWithBody: ScenarioIterationWithBodyDto,
): ScenarioIteration {
  const triggerDto =
    scenarioIterationWithBody.body.trigger_condition_ast_expression;
  const configDto = scenarioIterationWithBody.body.sanction_check_config;

  return {
    id: scenarioIterationWithBody.id,
    scenarioId: scenarioIterationWithBody.scenario_id,
    version: scenarioIterationWithBody.version,
    createdAt: scenarioIterationWithBody.created_at,
    updatedAt: scenarioIterationWithBody.updated_at,
    scoreReviewThreshold: scenarioIterationWithBody.body.score_review_threshold,
    scoreBlockAndReviewThreshold:
      scenarioIterationWithBody.body.score_block_and_review_threshold,
    scoreDeclineThreshold:
      scenarioIterationWithBody.body.score_decline_threshold,
    rules: scenarioIterationWithBody.body.rules.map(adaptScenarioIterationRule),
    schedule: scenarioIterationWithBody.body.schedule,
    trigger: triggerDto ? adaptAstNode(triggerDto) : null,
    sanctionCheckConfig: configDto ? adaptSanctionCheckConfig(configDto) : null,
  };
}

export function adaptScenarioIterationSummary(
  dto: ScenarioIterationDto,
): ScenarioIterationSummary {
  return {
    id: dto.id,
    scenarioId: dto.scenario_id,
    version: dto.version,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
