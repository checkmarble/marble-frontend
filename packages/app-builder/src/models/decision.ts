import {
  type DecisionDetailDto,
  type DecisionDto,
  type Error,
  type RuleExecutionDto,
  type ScheduledExecutionDto,
} from 'marble-api';
import invariant from 'tiny-invariant';
import { assertNever } from 'typescript-utils';

import { adaptCase, type Case } from './cases';
import { adaptNodeEvaluation, type NodeEvaluation } from './node-evaluation';
import { type Outcome } from './outcome';

export const nonPendingReviewStatuses = ['approve', 'decline'] as const;
export const reviewStatuses = ['pending', ...nonPendingReviewStatuses] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export interface Decision {
  case?: Case;
  createdAt: string;
  error?: Error;
  id: string;
  outcome: Outcome;
  reviewStatus?: ReviewStatus;
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
  scheduledExecutionId?: string;
}

export interface ScheduledExecution {
  id: string;
  /** Whether the execution was manual or not */
  manual: boolean;
  status: 'pending' | 'processing' | 'success' | 'failure' | 'partial_failure';
  numberOfCreatedDecisions: number;
  numberOfEvaluatedDecisions: number;
  numberOfPlannedDecisions: number | null;
  scenarioId: string;
  scenarioIterationId: string;
  scenarioName: string;
  scenarioTriggerObjectType: string;
  startedAt: string;
  finishedAt: string | null;
}

export function adaptScheduledExecution(
  dto: ScheduledExecutionDto,
): ScheduledExecution {
  return {
    id: dto.id,
    manual: dto.manual,
    status: dto.status,
    numberOfCreatedDecisions: dto.number_of_created_decisions,
    numberOfEvaluatedDecisions: dto.number_of_evaluated_decisions,
    numberOfPlannedDecisions: dto.number_of_planned_decisions,
    scenarioId: dto.scenario_id,
    scenarioIterationId: dto.scenario_iteration_id,
    scenarioName: dto.scenario_name,
    scenarioTriggerObjectType: dto.scenario_trigger_object_type,
    startedAt: dto.started_at,
    finishedAt: dto.finished_at,
  };
}

interface RuleExecutionCore {
  name: string;
  description?: string;
  ruleId: string;
  evaluation?: NodeEvaluation;
}

export interface RuleExecutionNoHit extends RuleExecutionCore {
  outcome: 'no_hit';
}

export function isRuleExecutionNoHit(
  ruleExecution: RuleExecution,
): ruleExecution is RuleExecutionNoHit {
  return ruleExecution.outcome === 'no_hit';
}

export interface RuleExecutionHit extends RuleExecutionCore {
  outcome: 'hit';
  scoreModifier: number;
}

export function isRuleExecutionHit(
  ruleExecution: RuleExecution,
): ruleExecution is RuleExecutionHit {
  return ruleExecution.outcome === 'hit';
}

export enum RuleExecutionErrorCode {
  DivisionByZero = 100,
  NullValueFound = 200,
}

export interface RuleExecutionError extends RuleExecutionCore {
  outcome: 'error';
  error: Error;
  errorCode: RuleExecutionErrorCode;
}

export function isRuleExecutionError(
  ruleExecution: RuleExecution,
): ruleExecution is RuleExecutionError {
  return ruleExecution.outcome === 'error';
}

export interface RuleExecutionSnoozed extends RuleExecutionCore {
  outcome: 'snoozed';
}

export function isRuleExecutionSnoozed(
  ruleExecution: RuleExecution,
): ruleExecution is RuleExecutionSnoozed {
  return ruleExecution.outcome === 'snoozed';
}

export type RuleExecution =
  | RuleExecutionNoHit
  | RuleExecutionHit
  | RuleExecutionSnoozed
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
    reviewStatus: dto.review_status,
    scenario: {
      id: dto.scenario.id,
      name: dto.scenario.name,
      description: dto.scenario.description,
      scenarioIterationId: dto.scenario.scenario_iteration_id,
      version: dto.scenario.version,
    },
    score: dto.score,
    case: dto.case ? adaptCase(dto.case) : undefined,
    scheduledExecutionId: dto.scheduled_execution_id,
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
  switch (dto.outcome) {
    case 'hit': {
      return {
        ...ruleExecution,
        outcome: 'hit',
        scoreModifier: dto.score_modifier,
      };
    }
    case 'error': {
      invariant(
        dto.error,
        '[RuleExecutionDto] error is missing for error outcome',
      );
      return {
        ...ruleExecution,
        outcome: 'error',
        error: dto.error,
        errorCode: dto.error.code,
      };
    }
    case 'snoozed': {
      return {
        ...ruleExecution,
        outcome: 'snoozed',
      };
    }
    case 'no_hit': {
      return {
        ...ruleExecution,
        outcome: 'no_hit',
      };
    }
    default:
      assertNever('[RuleExecutionDto] unknown outcome:', dto.outcome);
  }
}

export function adaptDecisionDetail(dto: DecisionDetailDto): DecisionDetail {
  return {
    ...adaptDecision(dto),
    rules: dto.rules.map(adaptRuleExecutionDto),
  };
}
