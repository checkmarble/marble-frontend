import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptCaseDetailDto, type CaseDetail } from '@app-builder/models/cases';
import {
  adaptPagination,
  type FiltersWithPagination,
  type PaginatedResponse,
} from '@app-builder/models/pagination';
import { add } from 'date-fns/add';
import { type Case, type CaseStatus, type UpdateCaseBody } from 'marble-api';
import { Temporal } from 'temporal-polyfill';

export type CaseFilters = {
  statuses?: CaseStatus[];
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
  inboxIds?: string[];
};

export type CaseFiltersWithPagination = FiltersWithPagination<CaseFilters>;

export interface CaseRepository {
  listCases(args: CaseFiltersWithPagination): Promise<PaginatedResponse<Case>>;
  getCase(args: { caseId: string }): Promise<CaseDetail>;
  updateCase(args: {
    caseId: string;
    body: UpdateCaseBody;
  }): Promise<CaseDetail>;
  addComment(args: {
    caseId: string;
    body: {
      comment: string;
    };
  }): Promise<CaseDetail>;
  setTags(args: { caseId: string; tagIds: string[] }): Promise<CaseDetail>;
}

export function getCaseRepository() {
  return (marbleApiClient: MarbleApi): CaseRepository => ({
    listCases: async ({ dateRange, inboxIds, statuses, ...rest }) => {
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

      const { items, ...pagination } = await marbleApiClient.listCases({
        startDate,
        endDate,
        inboxId: inboxIds,
        status: statuses,
        ...rest,
      });

      return {
        items,
        ...adaptPagination(pagination),
      };
    },
    getCase: async ({ caseId }) => {
      const result = await marbleApiClient.getCase(caseId);
      return adaptCaseDetailDto(result);
    },
    updateCase: async ({ caseId, body }) => {
      const result = await marbleApiClient.updateCase(caseId, body);
      return adaptCaseDetailDto(result.case);
    },
    addComment: async ({ caseId, body }) => {
      const result = await marbleApiClient.addCommentToCase(caseId, body);
      return adaptCaseDetailDto(result.case);
    },
    setTags: async ({ caseId, tagIds }) => {
      const result = await marbleApiClient.updateTagsForCase(caseId, {
        tag_ids: tagIds,
      });
      return adaptCaseDetailDto(result.case);
    },
  });
}
