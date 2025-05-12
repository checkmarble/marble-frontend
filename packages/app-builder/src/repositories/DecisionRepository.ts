import type { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptDecision,
  adaptDecisionDetail,
  adaptScheduledExecution,
  type Decision,
  type DecisionDetail,
  type ReviewStatus,
  type ScheduledExecution,
} from '@app-builder/models/decision';
import { adaptGoTimeDuration } from '@app-builder/models/duration';
import type { Outcome } from '@app-builder/models/outcome';
import {
  adaptPagination,
  type FiltersWithPagination,
  type PaginatedResponse,
} from '@app-builder/models/pagination';
import {
  adaptSnoozesOfDecision,
  type SnoozeDecisionInput,
  type SnoozesOfDecision,
} from '@app-builder/models/rule-snooze';
import { add } from 'date-fns/add';
import { Temporal } from 'temporal-polyfill';

export type DecisionFilters = {
  caseId?: string[];
  dateRange?:
    | {
        type: 'static';
        startDate?: string;
        endDate?: string;
      }
    | {
        type: 'dynamic';
        fromNow: string;
      };
  hasCase?: boolean;
  outcome?: Outcome[];
  pivotValue?: string;
  scenarioId?: string[];
  caseInboxId?: string[];
  reviewStatus?: ReviewStatus[];
  scheduledExecutionId?: string[];
  triggerObject?: string[];
};

export type DecisionFiltersWithPagination = FiltersWithPagination<DecisionFilters>;

export interface DecisionRepository {
  listDecisions(args: DecisionFiltersWithPagination): Promise<PaginatedResponse<Decision>>;
  listScheduledExecutions(args?: { scenarioId?: string }): Promise<ScheduledExecution[]>;
  getDecisionById(id: string): Promise<DecisionDetail>;
  getDecisionActiveSnoozes(decisionId: string): Promise<SnoozesOfDecision>;
  createSnoozeForDecision(
    decisionId: string,
    snoozeDecisionInput: SnoozeDecisionInput,
  ): Promise<SnoozesOfDecision>;
}

export function makeGetDecisionRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): DecisionRepository => ({
    listDecisions: async ({
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
      ...rest
    }) => {
      let startDate, endDate: string | undefined;
      if (dateRange?.type === 'static') {
        startDate = dateRange?.startDate;
        endDate = dateRange?.endDate;
      }
      if (dateRange?.type === 'dynamic') {
        const fromNowDuration = Temporal.Duration.from(dateRange?.fromNow);
        //TODO(timezone): until we get user TZ, timezone is the server one here since the endpoint is called from action/loader (should not be a real issue regarding the use case)
        startDate = add(new Date(), fromNowDuration).toISOString();
      }

      const { items, ...pagination } = await marbleCoreApiClient.listDecisions({
        caseId,
        endDate,
        hasCase,
        outcome,
        pivotValue,
        scenarioId,
        caseInboxId,
        scheduledExecutionId,
        triggerObject,
        startDate,
        reviewStatus,
        ...rest,
      });

      return {
        items: items.map(adaptDecision),
        ...adaptPagination(pagination),
      };
    },
    getDecisionById: async (id) => {
      const decisionDetailDto = await marbleCoreApiClient.getDecision(id);
      const decision = adaptDecisionDetail(decisionDetailDto);
      decision.rules = decision.rules.sort((lhs, rhs) => lhs.name.localeCompare(rhs.name));
      return decision;
    },
    listScheduledExecutions: async (args = {}) => {
      const { scheduled_executions } = await marbleCoreApiClient.listScheduledExecutions(args);
      return scheduled_executions.map(adaptScheduledExecution);
    },
    getDecisionActiveSnoozes: async (decisionId) => {
      const { snoozes } = await marbleCoreApiClient.getDecisionActiveSnoozes(decisionId);
      return adaptSnoozesOfDecision(snoozes);
    },
    createSnoozeForDecision: async (decisionId, snoozeDecisionInput) => {
      const { snoozes } = await marbleCoreApiClient.createSnoozeForDecision(decisionId, {
        rule_id: snoozeDecisionInput.ruleId,
        duration: adaptGoTimeDuration(snoozeDecisionInput.duration),
        comment: snoozeDecisionInput.comment,
      });
      return adaptSnoozesOfDecision(snoozes);
    },
  });
}
