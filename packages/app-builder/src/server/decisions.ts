import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptDecision,
  adaptDecisionDetail,
  adaptScheduledExecution,
  type Decision,
  type DecisionDetails,
  type DecisionFiltersWithPagination,
  type ScheduledExecution,
} from '@app-builder/models/decision';
import { adaptGoTimeDuration } from '@app-builder/models/duration';
import { isRequestTimeoutHttpError, RequestTimeoutError } from '@app-builder/models/http-errors';
import { adaptPagination, defaultPaginationSize, type PaginatedResponse } from '@app-builder/models/pagination';
import {
  adaptSnoozesOfDecision,
  type SnoozeDecisionInput,
  type SnoozesOfDecision,
} from '@app-builder/models/rule-snooze';
import { resolveDateRange } from '@app-builder/utils/schema/filterSchema';

export async function listDecisions(
  api: MarbleCoreApi,
  {
    caseId,
    dateRange,
    hasCase,
    outcome,
    pivotValue,
    scenarioId,
    caseInboxId,
    reviewStatus,
    scheduledExecutionId,
    triggerObject,
    triggerObjectId,
    ...rest
  }: DecisionFiltersWithPagination,
): Promise<PaginatedResponse<Decision>> {
  const { startDate, endDate } = resolveDateRange(dateRange);

  try {
    // Nb: the constant value of 25 for limit is used for rank display in PaginationButtons - logic to adapt if we make it more dynamic
    const { items, ...pagination } = await api.listDecisions({
      caseId,
      endDate,
      hasCase,
      outcome,
      pivotValue,
      scenarioId,
      caseInboxId,
      scheduledExecutionId,
      triggerObject,
      triggerObjectId: triggerObjectId ? [triggerObjectId] : undefined,
      startDate,
      reviewStatus,
      limit: defaultPaginationSize,
      ...rest,
    });

    return {
      items: items.map(adaptDecision),
      ...adaptPagination(pagination),
    };
  } catch (error) {
    if (isRequestTimeoutHttpError(error)) {
      throw new RequestTimeoutError();
    }
    throw error;
  }
}

export async function getDecisionById(
  api: MarbleCoreApi,
  id: string,
  args?: { includeRuleEvaluation?: boolean },
): Promise<DecisionDetails> {
  const decisionDetailDto = await api.getDecision(id);
  const decision = adaptDecisionDetail(decisionDetailDto, args?.includeRuleEvaluation ?? true);
  decision.rules = decision.rules.sort((lhs, rhs) => lhs.name.localeCompare(rhs.name));
  return decision;
}

export async function listScheduledExecutions(
  api: MarbleCoreApi,
  args: { scenarioId?: string } = {},
): Promise<ScheduledExecution[]> {
  const { scheduled_executions } = await api.listScheduledExecutions(args);
  return scheduled_executions.map(adaptScheduledExecution);
}

export async function getDecisionActiveSnoozes(api: MarbleCoreApi, decisionId: string): Promise<SnoozesOfDecision> {
  const { snoozes } = await api.getDecisionActiveSnoozes(decisionId);
  return adaptSnoozesOfDecision(snoozes);
}

export async function createSnoozeForDecision(
  api: MarbleCoreApi,
  decisionId: string,
  snoozeDecisionInput: SnoozeDecisionInput,
): Promise<SnoozesOfDecision> {
  const { snoozes } = await api.createSnoozeForDecision(decisionId, {
    rule_id: snoozeDecisionInput.ruleId,
    duration: adaptGoTimeDuration(snoozeDecisionInput.duration),
    comment: snoozeDecisionInput.comment,
  });
  return adaptSnoozesOfDecision(snoozes);
}
