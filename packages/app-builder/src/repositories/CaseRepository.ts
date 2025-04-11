import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptCase,
  adaptCaseCreateBody,
  adaptCaseDetail,
  adaptPivotObject,
  adaptUpdateCaseBodyDto,
  type Case,
  type CaseDetail,
  type CaseStatus,
  type CaseUpdateBody,
  type PivotObject,
} from '@app-builder/models/cases';
import { type ReviewStatus } from '@app-builder/models/decision';
import {
  adaptPagination,
  type FiltersWithPagination,
  type PaginatedResponse,
} from '@app-builder/models/pagination';
import { add } from 'date-fns/add';
import { Temporal } from 'temporal-polyfill';

export type CaseFilters = {
  snoozed?: boolean;
  statuses?: CaseStatus[];
  name?: string;
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
  createCase(data: { name: string; inboxId: string; decisionIds?: string[] }): Promise<CaseDetail>;
  getCase(args: { caseId: string }): Promise<CaseDetail>;
  updateCase(args: { caseId: string; body: CaseUpdateBody }): Promise<CaseDetail>;
  snoozeCase(args: { caseId: string; snoozeUntil: string }): Promise<unknown>;
  unsnoozeCase(args: { caseId: string }): Promise<unknown>;
  listPivotObjects(args: { caseId: string }): Promise<PivotObject[] | null>;
  addComment(args: {
    caseId: string;
    body: {
      comment: string;
    };
  }): Promise<CaseDetail>;
  setTags(args: { caseId: string; tagIds: string[] }): Promise<CaseDetail>;
  addDecisionsToCase(args: { caseId: string; decisionIds: string[] }): Promise<CaseDetail>;
  reviewDecision(args: {
    decisionId: string;
    reviewComment: string;
    reviewStatus: ReviewStatus;
  }): Promise<CaseDetail>;
}

export function makeGetCaseRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): CaseRepository => ({
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

      const { items, ...pagination } = await marbleCoreApiClient.listCases({
        startDate,
        endDate,
        inboxId: inboxIds,
        status: statuses,
        includeSnoozed: rest.snoozed,
        ...rest,
      });

      return {
        items: items.map(adaptCase),
        ...adaptPagination(pagination),
      };
    },
    listPivotObjects: async ({ caseId }) => {
      const res = await marbleCoreApiClient.getPivotObjectsForCase(caseId);
      return res.pivot_objects?.map(adaptPivotObject) ?? null;
    },
    unsnoozeCase: ({ caseId }) => marbleCoreApiClient.unsnoozeCase(caseId),
    snoozeCase: ({ caseId, snoozeUntil }) =>
      marbleCoreApiClient.snoozeCase(caseId, { until: snoozeUntil }),
    createCase: async (data) => {
      const result = await marbleCoreApiClient.createCase(adaptCaseCreateBody(data));
      return adaptCaseDetail(result.case);
    },
    getCase: async ({ caseId }) => {
      const result = await marbleCoreApiClient.getCase(caseId);
      return adaptCaseDetail(result);
    },
    updateCase: async ({ caseId, body }) => {
      const result = await marbleCoreApiClient.updateCase(caseId, adaptUpdateCaseBodyDto(body));
      return adaptCaseDetail(result.case);
    },
    addComment: async ({ caseId, body }) => {
      const result = await marbleCoreApiClient.addCommentToCase(caseId, body);
      return adaptCaseDetail(result.case);
    },
    setTags: async ({ caseId, tagIds }) => {
      const result = await marbleCoreApiClient.updateTagsForCase(caseId, {
        tag_ids: tagIds,
      });
      return adaptCaseDetail(result.case);
    },
    addDecisionsToCase: async ({ caseId, decisionIds }) => {
      const result = await marbleCoreApiClient.addDecisionsToCase(caseId, {
        decision_ids: decisionIds,
      });
      return adaptCaseDetail(result.case);
    },
    reviewDecision: async ({ reviewComment, decisionId, reviewStatus }) => {
      const result = await marbleCoreApiClient.reviewDecision({
        decision_id: decisionId,
        review_comment: reviewComment,
        review_status: reviewStatus,
      });
      return adaptCaseDetail(result.case);
    },
  });
}
