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
  outcome?: Outcome[];
  triggerObject?: string[];
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
  scenarioId?: string[];
  hasCase?: boolean;
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
    listDecisions: async ({ dateRange, ...rest }) => {
      let startDate, endDate: string | undefined;
      if (dateRange?.type === 'static') {
        startDate = dateRange?.startDate;
        endDate = dateRange?.endDate;
      }
      if (dateRange?.type === 'dynamic') {
        const fromNowDuration = Temporal.Duration.from(dateRange?.fromNow);
        //TODO(timezone): until we get user TZ, timezone is the server one here (should not be a real issue regarding the use case)
        startDate = add(new Date(), fromNowDuration).toISOString();
      }

      const { items, ...pagination } = await marbleApiClient.listDecisions({
        ...rest,
        startDate,
        endDate,
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
