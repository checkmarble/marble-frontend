import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptDecision,
  adaptDecisionDetail,
  type Decision,
  type DecisionDetail,
} from '@app-builder/models/decision';
import {
  adaptPagination,
  type FiltersWithPagination,
  type PaginatedResponse,
} from '@app-builder/models/pagination';
import { add } from 'date-fns/add';
import { type Outcome } from 'marble-api';
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
  scheduledExecutionId?: string[];
  triggerObject?: string[];
};

export type DecisionFiltersWithPagination =
  FiltersWithPagination<DecisionFilters>;

export interface DecisionRepository {
  listDecisions(
    args: DecisionFiltersWithPagination,
  ): Promise<PaginatedResponse<Decision>>;
  getDecisionById(id: string): Promise<DecisionDetail>;
}

export function getDecisionRepository() {
  return (marbleApiClient: MarbleApi): DecisionRepository => ({
    listDecisions: async ({
      caseId,
      dateRange,
      hasCase,
      outcome,
      pivotValue,
      scenarioId,
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

      const { items, ...pagination } = await marbleApiClient.listDecisions({
        caseId,
        endDate,
        hasCase,
        outcome,
        pivotValue,
        scenarioId,
        scheduledExecutionId,
        triggerObject,
        startDate,
        ...rest,
      });

      return {
        items: items.map(adaptDecision),
        ...adaptPagination(pagination),
      };
    },
    getDecisionById: async (id) => {
      const decisionDetailDto = await marbleApiClient.getDecision(id);
      return adaptDecisionDetail(decisionDetailDto);
    },
  });
}
