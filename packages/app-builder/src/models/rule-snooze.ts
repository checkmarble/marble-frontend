import {
  type RuleSnoozeDto,
  type RuleSnoozeInformationDto,
  type RuleSnoozeWithRuleIdDto,
  type SnoozesOfDecisionDto,
  type SnoozesOfIterationDto,
} from 'marble-api';
import { type Temporal } from 'temporal-polyfill';

import { type DecisionDetail } from './decision';

export interface RuleSnooze {
  id: string;
  pivotValue: string;
  startsAt: string;
  endsAt: string;
  createdByUser: string;
  createdFromDecisionId?: string;
  createdFromRuleId: string;
}

export function adaptRuleSnooze(dto: RuleSnoozeDto): RuleSnooze {
  return {
    id: dto.id,
    pivotValue: dto.pivot_value,
    startsAt: dto.starts_at,
    endsAt: dto.ends_at,
    createdByUser: dto.created_by_user,
    createdFromDecisionId: dto.created_from_decision_id,
    createdFromRuleId: dto.created_from_rule_id,
  };
}

export interface RuleSnoozeWithRuleId extends RuleSnooze {
  ruleId: string;
}

export function adaptRuleSnoozeWithRuleId(
  dto: RuleSnoozeWithRuleIdDto,
): RuleSnoozeWithRuleId {
  return {
    ...adaptRuleSnooze(dto),
    ruleId: dto.rule_id,
  };
}

export interface RuleSnoozeDetail {
  id: string;
  pivotValue: string;
  startsAt: string;
  endsAt: string;
  createdByUser: string;
  createdFromDecisionId?: string;
  createdFromRule: {
    ruleId: string;
    ruleName: string;
    scenarioId: string;
    scenarioIterationId: string;
  };
}

export interface SnoozesOfDecision {
  decisionId: string;
  ruleSnoozes: RuleSnoozeWithRuleId[];
}

export function adaptSnoozesOfDecision(
  dto: SnoozesOfDecisionDto,
): SnoozesOfDecision {
  return {
    decisionId: dto.decision_id,
    ruleSnoozes: dto.rule_snoozes.map(adaptRuleSnoozeWithRuleId),
  };
}

export interface SnoozeDecisionInput {
  ruleId: string;
  duration: Temporal.Duration;
  comment?: string;
}

export interface RuleSnoozeInformation {
  ruleId: string;
  snoozeGroupId: string;
  hasSnoozesActive: boolean;
}

function adaptRuleSnoozeInformation(
  dto: RuleSnoozeInformationDto,
): RuleSnoozeInformation {
  return {
    ruleId: dto.rule_id,
    snoozeGroupId: dto.snooze_group_id,
    hasSnoozesActive: dto.has_snoozes_active,
  };
}

export interface SnoozesOfIteration {
  iterationId: string;
  ruleSnoozes: RuleSnoozeInformation[];
}

export function adaptSnoozesOfIteration(
  dto: SnoozesOfIterationDto,
): SnoozesOfIteration {
  return {
    iterationId: dto.iteration_id,
    ruleSnoozes: dto.rule_snoozes.map(adaptRuleSnoozeInformation),
  };
}
