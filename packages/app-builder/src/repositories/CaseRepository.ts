import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptCase,
  adaptCaseCreateBody,
  adaptCaseDetail,
  adaptCaseReview,
  adaptDetailedCaseDecision,
  adaptPivotObject,
  adaptSuspiciousActivityReport,
  adaptUpdateCaseBodyDto,
  type Case,
  type CaseDetail,
  CaseReview,
  type CaseStatus,
  type CaseUpdateBody,
  DetailedCaseDecision,
  type PivotObject,
  type SuspiciousActivityReport,
} from '@app-builder/models/cases';
import { type ReviewStatus } from '@app-builder/models/decision';
import {
  adaptKycCaseEnrichment,
  type KycCaseEnrichment,
} from '@app-builder/models/kyc-case-enrichment';
import {
  adaptPagination,
  type FiltersWithPagination,
  type PaginatedResponse,
} from '@app-builder/models/pagination';
import { add } from 'date-fns/add';
import { map } from 'remeda';
import { Temporal } from 'temporal-polyfill';

export const DEFAULT_CASE_PAGINATION_SIZE = 50;

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
  assigneeId?: string;
};

export type CaseFiltersWithPagination = FiltersWithPagination<CaseFilters>;

// file MUST not be present as an undefined value, because it will send "undefined" as a file
type SuspiciousActivityReportBody =
  | {
      status?: 'pending' | 'completed';
    }
  | {
      status?: 'pending' | 'completed';
      file: Blob;
    };

export interface CaseRepository {
  listCases(args: CaseFiltersWithPagination): Promise<PaginatedResponse<Case>>;
  createCase(data: { name: string; inboxId: string; decisionIds?: string[] }): Promise<CaseDetail>;
  getCase(args: { caseId: string }): Promise<CaseDetail>;
  updateCase(args: { caseId: string; body: CaseUpdateBody }): Promise<CaseDetail>;
  assignUser(args: { caseId: string; userId: string }): Promise<unknown>;
  unassignUser(args: { caseId: string }): Promise<unknown>;
  snoozeCase(args: { caseId: string; snoozeUntil: string }): Promise<unknown>;
  unsnoozeCase(args: { caseId: string }): Promise<unknown>;
  listPivotObjects(args: { caseId: string }): Promise<PivotObject[] | null>;
  getPivotRelatedCases(args: { pivotValue: string | number }): Promise<Case[]>;
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
  listSuspiciousActivityReports(args: { caseId: string }): Promise<SuspiciousActivityReport[]>;
  createSuspiciousActivityReport(args: {
    caseId: string;
    body: SuspiciousActivityReportBody;
  }): Promise<SuspiciousActivityReport>;
  updateSuspiciousActivityReport(args: {
    caseId: string;
    reportId: string;
    body: SuspiciousActivityReportBody;
  }): Promise<SuspiciousActivityReport>;
  deleteSuspiciousActivityReport(args: { caseId: string; reportId: string }): Promise<unknown>;
  getNextUnassignedCaseId(args: { caseId: string }): Promise<string | null>;
  escalateCase(args: { caseId: string }): Promise<unknown>;
  enqueueReviewForCase(args: { caseId: string }): Promise<unknown>;
  getMostRecentCaseReview(args: { caseId: string }): Promise<CaseReview[]>;
  getCaseFileDownloadLink(fileId: string): Promise<{ url: string }>;
  addCaseReviewFeedback(args: {
    caseId: string;
    reviewId: string;
    reaction: 'ok' | 'ko';
  }): Promise<void>;
  enrichPivotObjectOfCaseWithKyc(args: { caseId: string }): Promise<KycCaseEnrichment[]>;
  listCaseDecisions(
    args: {
      caseId: string;
    },
    options?: { limit?: number; cursorId?: string },
  ): Promise<{
    decisions: DetailedCaseDecision[];
    pagination: { hasMore: boolean; cursorId: string | null };
  }>;
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

      // Nb: the constant value of 25 for limit is used for rank display in PaginationButtons - logic to adapt if we make it more dynamic
      const { items, ...pagination } = await marbleCoreApiClient.listCases({
        startDate,
        endDate,
        inboxId: inboxIds,
        status: statuses,
        includeSnoozed: rest.snoozed,
        limit: DEFAULT_CASE_PAGINATION_SIZE,
        ...rest,
      });

      return {
        items: items.map(adaptCase),
        ...adaptPagination(pagination),
      };
    },
    assignUser: ({ caseId, userId }) => marbleCoreApiClient.assignUser(caseId, { user_id: userId }),
    unassignUser: ({ caseId }) => marbleCoreApiClient.unassignUser(caseId),
    listPivotObjects: async ({ caseId }) => {
      const res = await marbleCoreApiClient.getPivotObjectsForCase(caseId);
      return res.pivot_objects?.map(adaptPivotObject) ?? null;
    },
    getPivotRelatedCases: async ({ pivotValue }) => {
      const res = await marbleCoreApiClient.getPivotRelatedCases(pivotValue.toString());
      return res.map((dto) => adaptCase(dto));
    },
    unsnoozeCase: ({ caseId }) => marbleCoreApiClient.unsnoozeCase(caseId),
    snoozeCase: ({ caseId, snoozeUntil }) =>
      marbleCoreApiClient.snoozeCase(caseId, { until: snoozeUntil }),
    createCase: async (data) => {
      const result = await marbleCoreApiClient.createCase(adaptCaseCreateBody(data));
      return adaptCaseDetail(result.case, marbleCoreApiClient);
    },
    getCase: async ({ caseId }) => {
      const result = await marbleCoreApiClient.getCase(caseId);
      return adaptCaseDetail(result, marbleCoreApiClient);
    },
    updateCase: async ({ caseId, body }) => {
      const result = await marbleCoreApiClient.updateCase(caseId, adaptUpdateCaseBodyDto(body));
      return adaptCaseDetail(result.case, marbleCoreApiClient);
    },
    addComment: async ({ caseId, body }) => {
      const result = await marbleCoreApiClient.addCommentToCase(caseId, body);
      return adaptCaseDetail(result.case, marbleCoreApiClient);
    },
    setTags: async ({ caseId, tagIds }) => {
      const result = await marbleCoreApiClient.updateTagsForCase(caseId, {
        tag_ids: tagIds,
      });
      return adaptCaseDetail(result.case, marbleCoreApiClient);
    },
    addDecisionsToCase: async ({ caseId, decisionIds }) => {
      const result = await marbleCoreApiClient.addDecisionsToCase(caseId, {
        decision_ids: decisionIds,
      });
      return adaptCaseDetail(result.case, marbleCoreApiClient);
    },
    reviewDecision: async ({ reviewComment, decisionId, reviewStatus }) => {
      const result = await marbleCoreApiClient.reviewDecision({
        decision_id: decisionId,
        review_comment: reviewComment,
        review_status: reviewStatus,
      });
      return adaptCaseDetail(result.case, marbleCoreApiClient);
    },
    listSuspiciousActivityReports: async ({ caseId }) =>
      map(await marbleCoreApiClient.sarList(caseId), adaptSuspiciousActivityReport),
    createSuspiciousActivityReport: async ({ caseId, body }) =>
      adaptSuspiciousActivityReport(await marbleCoreApiClient.sarCreate(caseId, body)),
    updateSuspiciousActivityReport: async ({ caseId, reportId, body }) => {
      return adaptSuspiciousActivityReport(
        await marbleCoreApiClient.sarUpdate(caseId, reportId, body),
      );
    },
    deleteSuspiciousActivityReport: async ({ caseId, reportId }) =>
      marbleCoreApiClient.sarDelete(caseId, reportId),
    getNextUnassignedCaseId: async ({ caseId }) =>
      marbleCoreApiClient
        .getNextCase(caseId)
        .then(({ id }) => id)
        .catch(() => null),
    escalateCase: ({ caseId }) => marbleCoreApiClient.escalateCase(caseId),
    enqueueReviewForCase: async ({ caseId }) => {
      await marbleCoreApiClient.enqueueReviewForCase(caseId);
    },
    getMostRecentCaseReview: async ({ caseId }) => {
      const reviews = await marbleCoreApiClient.getMostRecentCaseReview(caseId);
      return reviews.map(adaptCaseReview);
    },
    getCaseFileDownloadLink: async (fileId) => {
      return marbleCoreApiClient.downloadCaseFile(fileId);
    },
    addCaseReviewFeedback: async ({ caseId, reviewId, reaction }) => {
      await marbleCoreApiClient.addOrUpdateCaseReviewFeedback(caseId, reviewId, { reaction });
    },
    enrichPivotObjectOfCaseWithKyc: async ({ caseId }) => {
      const result = await marbleCoreApiClient.enrichPivotObjectOfCaseWithKyc(caseId);
      return result.results?.map(adaptKycCaseEnrichment) ?? [];
    },
    listCaseDecisions: async ({ caseId }, options = {}) => {
      const result = await marbleCoreApiClient.getPaginatedCaseDecisions(caseId, options);

      return {
        decisions: result.decisions.map(adaptDetailedCaseDecision),
        pagination: {
          hasMore: result.pagination.has_more ?? false,
          cursorId: result.pagination.next_cursor_id ?? null,
        },
      };
    },
  });
}
