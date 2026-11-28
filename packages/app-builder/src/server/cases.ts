import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptCase,
  adaptCaseCreateBody,
  adaptCaseDetail,
  adaptCaseObjectReferences,
  adaptDetailedCaseDecision,
  adaptUpdateCaseBodyDto,
  type Case,
  type CaseDetail,
  type CaseFiltersWithPagination,
  type CaseObjectReference,
  type CaseUpdateBody,
  DEFAULT_CASE_PAGINATION_SIZE,
  type DetailedCaseDecision,
} from '@app-builder/models/cases';
import { type ReviewStatus } from '@app-builder/models/decision';
import { adaptPagination, type PaginatedResponse } from '@app-builder/models/pagination';
import { resolveDateRange } from '@app-builder/utils/schema/filterSchema';

export async function listCases(
  api: MarbleCoreApi,
  { dateRange, inboxIds, statuses, tagId, qualification, type, ...rest }: CaseFiltersWithPagination,
): Promise<PaginatedResponse<Case>> {
  const { startDate, endDate } = resolveDateRange(dateRange);

  // Nb: the constant value of 25 for limit is used for rank display in PaginationButtons - logic to adapt if we make it more dynamic
  const { items, ...pagination } = await api.listCases({
    startDate,
    endDate,
    inboxId: inboxIds,
    status: statuses,
    includeSnoozed: rest.snoozed,
    limit: DEFAULT_CASE_PAGINATION_SIZE,
    tagId,
    qualification,
    $type: type,
    ...rest,
  });

  return {
    items: items.map(adaptCase),
    ...adaptPagination(pagination),
  };
}

export async function createCase(
  api: MarbleCoreApi,
  data: { name: string; inboxId: string; decisionIds?: string[] },
): Promise<CaseDetail> {
  const result = await api.createCase(adaptCaseCreateBody(data));
  return adaptCaseDetail(result.case, api);
}

export async function createCaseFromObjects(
  api: MarbleCoreApi,
  { name, inboxId, objects }: { name: string; inboxId: string; objects: CaseObjectReference[] },
): Promise<CaseDetail> {
  const result = await api.createCase({
    name,
    inbox_id: inboxId,
    entities: adaptCaseObjectReferences(objects),
  });
  return adaptCaseDetail(result.case, api);
}

export async function getCase(api: MarbleCoreApi, { caseId }: { caseId: string }): Promise<CaseDetail> {
  const result = await api.getCase(caseId);
  return adaptCaseDetail(result, api);
}

export async function updateCase(
  api: MarbleCoreApi,
  { caseId, body }: { caseId: string; body: CaseUpdateBody },
): Promise<CaseDetail> {
  const result = await api.updateCase(caseId, adaptUpdateCaseBodyDto(body));
  return adaptCaseDetail(result.case, api);
}

export async function assignUser(
  api: MarbleCoreApi,
  { caseId, userId }: { caseId: string; userId: string },
): Promise<unknown> {
  return api.assignUser(caseId, { user_id: userId });
}

export async function snoozeCase(
  api: MarbleCoreApi,
  { caseId, snoozeUntil }: { caseId: string; snoozeUntil: string },
): Promise<unknown> {
  return api.snoozeCase(caseId, { until: snoozeUntil });
}

export async function getPivotRelatedCases(
  api: MarbleCoreApi,
  { pivotValue }: { pivotValue: string | number },
): Promise<Case[]> {
  const res = await api.getPivotRelatedCases(pivotValue.toString());
  return res.map((dto) => adaptCase(dto));
}

export async function addComment(
  api: MarbleCoreApi,
  { caseId, body }: { caseId: string; body: { comment: string } },
): Promise<CaseDetail> {
  const result = await api.addCommentToCase(caseId, body);
  return adaptCaseDetail(result.case, api);
}

export async function setTags(
  api: MarbleCoreApi,
  { caseId, tagIds }: { caseId: string; tagIds: string[] },
): Promise<CaseDetail> {
  const result = await api.updateTagsForCase(caseId, {
    tag_ids: tagIds,
  });
  return adaptCaseDetail(result.case, api);
}

export async function addDecisionsToCase(
  api: MarbleCoreApi,
  { caseId, decisionIds }: { caseId: string; decisionIds: string[] },
): Promise<CaseDetail> {
  const result = await api.addDecisionsToCase(caseId, {
    decision_ids: decisionIds,
  });
  return adaptCaseDetail(result.case, api);
}

export async function addObjectsToCase(
  api: MarbleCoreApi,
  { caseId, objects }: { caseId: string; objects: CaseObjectReference[] },
): Promise<CaseDetail> {
  const result = await api.addEntitiesToCase(caseId, {
    entities: adaptCaseObjectReferences(objects),
  });
  return adaptCaseDetail(result.case, api);
}

export async function removeObjectsFromCase(
  api: MarbleCoreApi,
  { caseId, objects }: { caseId: string; objects: CaseObjectReference[] },
): Promise<CaseDetail> {
  const result = await api.removeEntitiesFromCase(caseId, {
    entities: adaptCaseObjectReferences(objects),
  });
  return adaptCaseDetail(result.case, api);
}

export async function reviewDecision(
  api: MarbleCoreApi,
  {
    reviewComment,
    decisionId,
    reviewStatus,
  }: { decisionId: string; reviewComment: string; reviewStatus: ReviewStatus },
): Promise<CaseDetail> {
  const result = await api.reviewDecision({
    decision_id: decisionId,
    review_comment: reviewComment,
    review_status: reviewStatus,
  });
  return adaptCaseDetail(result.case, api);
}

export async function getNextUnassignedCaseId(
  api: MarbleCoreApi,
  { caseId }: { caseId: string },
): Promise<string | null> {
  return api
    .getNextCase(caseId)
    .then(({ id }) => id)
    .catch(() => null);
}

export async function addCaseReviewFeedback(
  api: MarbleCoreApi,
  { caseId, reviewId, reaction }: { caseId: string; reviewId: string; reaction: 'ok' | 'ko' },
): Promise<void> {
  await api.addOrUpdateCaseReviewFeedback(caseId, reviewId, { reaction });
}

export async function listCaseDecisions(
  api: MarbleCoreApi,
  { caseId }: { caseId: string },
  options: { limit?: number; cursorId?: string } = {},
): Promise<{
  decisions: DetailedCaseDecision[];
  pagination: { hasMore: boolean; cursorId: string | null };
}> {
  const result = await api.getPaginatedCaseDecisions(caseId, options);

  return {
    decisions: result.decisions.map(adaptDetailedCaseDecision),
    pagination: {
      hasMore: result.pagination.has_more ?? false,
      cursorId: result.pagination.next_cursor_id ?? null,
    },
  };
}
