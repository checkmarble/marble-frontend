import {
  type Case,
  type DecisionDetailDto,
  type DecisionDto,
  type Error,
  type Outcome,
  type RuleExecutionDto,
} from 'marble-api';

import { adaptNodeEvaluation, type NodeEvaluation } from './node-evaluation';

export interface Decision {
  case?: Case;
  createdAt: string;
  error?: Error;
  id: string;
  outcome: Outcome;
  pivotValues: {
    id?: string;
    value?: string;
  }[];
  scenario: {
    id: string;
    name: string;
    description: string;
    scenarioIterationId: string;
    version: number;
  };
  score: number;
  triggerObject: Record<string, unknown>;
  triggerObjectType: string;
}

interface RuleExecutionCore {
  name: string;
  description?: string;
  ruleId: string;
  evaluation?: NodeEvaluation;
}

export interface RuleExecutionNoHit extends RuleExecutionCore {
  status: 'no_hit';
}

export function isRuleExecutionNoHit(
  ruleExecution: RuleExecution,
): ruleExecution is RuleExecutionNoHit {
  return ruleExecution.status === 'no_hit';
}

export interface RuleExecutionHit extends RuleExecutionCore {
  status: 'hit';
  scoreModifier: number;
}

export function isRuleExecutionHit(
  ruleExecution: RuleExecution,
): ruleExecution is RuleExecutionHit {
  return ruleExecution.status === 'hit';
}

export interface RuleExecutionError extends RuleExecutionCore {
  status: 'error';
  error: Error;
}

export function isRuleExecutionError(
  ruleExecution: RuleExecution,
): ruleExecution is RuleExecutionError {
  return ruleExecution.status === 'error';
}

export type RuleExecution =
  | RuleExecutionNoHit
  | RuleExecutionHit
  | RuleExecutionError;

export interface DecisionDetail extends Decision {
  rules: RuleExecution[];
}

export function adaptDecision(dto: DecisionDto): Decision {
  return {
    id: dto.id,
    createdAt: dto.created_at,
    triggerObject: dto.trigger_object,
    triggerObjectType: dto.trigger_object_type,
    pivotValues: dto.pivot_values.map(({ pivot_id, pivot_value }) => ({
      id: pivot_id ?? undefined,
      value: pivot_value ?? undefined,
    })),
    outcome: dto.outcome,
    scenario: {
      id: dto.scenario.id,
      name: dto.scenario.name,
      description: dto.scenario.description,
      scenarioIterationId: dto.scenario.scenario_iteration_id,
      version: dto.scenario.version,
    },
    score: dto.score,
    case: dto.case,
  };
}

function adaptRuleExecutionDto(dto: RuleExecutionDto): RuleExecution {
  const ruleExecution: RuleExecutionCore = {
    name: dto.name,
    ruleId: dto.rule_id,
    description: dto.description || undefined,
    evaluation: dto.rule_evaluation
      ? adaptNodeEvaluation(dto.rule_evaluation)
      : undefined,
  };
  if (dto.result) {
    return {
      ...ruleExecution,
      status: 'hit',
      scoreModifier: dto.score_modifier,
    };
  }
  if (dto.error) {
    return {
      ...ruleExecution,
      status: 'error',
      error: dto.error,
    };
  }
  return {
    ...ruleExecution,
    status: 'no_hit',
  };
}

export function adaptDecisionDetail(dto: DecisionDetailDto): DecisionDetail {
  return {
    ...adaptDecision(dto),
    rules: dto.rules.map(adaptRuleExecutionDto),
  };
}
