import {
  type RuleSnoozeDto,
  type RuleSnoozeInformationDto,
  type SnoozesOfDecisionDto,
  type SnoozesOfIterationDto,
} from 'marble-api';

export interface RuleSnooze {
  id: string;
  ruleId: string;
  pivotValue: string;
  startsAt: string;
  endsAt: string;
  createdByUser: string;
}

function adaptRuleSnooze(dto: RuleSnoozeDto): RuleSnooze {
  return {
    id: dto.id,
    ruleId: dto.rule_id,
    pivotValue: dto.pivot_value,
    startsAt: dto.starts_at,
    endsAt: dto.ends_at,
    createdByUser: dto.created_by_user,
  };
}

export interface SnoozesOfDecision {
  decisionId: string;
  ruleSnoozes: RuleSnooze[];
}

export function adaptSnoozesOfDecision(
  dto: SnoozesOfDecisionDto,
): SnoozesOfDecision {
  return {
    decisionId: dto.decision_id,
    ruleSnoozes: dto.rule_snoozes.map(adaptRuleSnooze),
  };
}

export interface SnoozeDecisionInput {
  ruleId: string;
  duration: string;
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
