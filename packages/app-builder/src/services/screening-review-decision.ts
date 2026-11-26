import type { CaseDetail } from '@app-builder/models/cases';
import type { ContinuousScreening } from '@app-builder/models/continuous-screening';
import {
  isForbiddenHttpError,
  isHttpError,
  isNotFoundHttpError,
  marbleApiErrorMessage,
} from '@app-builder/models/http-errors';
import {
  needsFalsePositiveClosure,
  type ScreeningReviewDecision,
  type ScreeningReviewEscalation,
  screeningReviewCaseFollowUp,
} from '@app-builder/models/screening-review';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import type { ContinuousScreeningRepository } from '@app-builder/repositories/ContinuousScreeningRepository';
import { FORBIDDEN, NOT_FOUND, OK, UNPROCESSABLE_ENTITY } from '@app-builder/utils/http/http-status-codes';

export interface ScreeningReviewDecisionInput {
  caseId: string;
  screeningId: string;
  matchId: string;
  status: ScreeningReviewDecision;
  comment?: string;
}

/** Why a write was refused. The page shows a message for each, then refetches. */
export type ScreeningReviewRejection =
  /** The case, screening or hit no longer exists, or the case is closed. */
  | 'unavailable'
  /** The case is now assigned to someone else. */
  | 'reassigned'
  /** The case moved to an inbox the user can't access. */
  | 'forbidden'
  /** The screening was finished elsewhere. */
  | 'not_in_review'
  /** Someone else reviewed the hit, or a Hit on another hit skipped it. */
  | 'already_reviewed'
  /** The screening has hits to review again, or another screening of the case is still open. */
  | 'not_closable'
  | 'not_escalatable';

export type ScreeningReviewDecisionResult =
  | {
      ok: true;
      /** `null` when the screening couldn't be read back. The next load recovers. */
      screeningStatus: ContinuousScreening['status'] | null;
      caseClosed: boolean;
      escalation?: ScreeningReviewEscalation;
    }
  | { ok: false; reason: ScreeningReviewRejection };

type FollowUpCases = Pick<CaseRepository, 'getCase' | 'updateCase' | 'escalateCase'>;

type Repositories = {
  cases: FollowUpCases;
  continuousScreening: Pick<ContinuousScreeningRepository, 'updateMatchStatus'>;
};

type TentativeReviewRepositories = {
  cases: FollowUpCases;
  continuousScreening: Pick<ContinuousScreeningRepository, 'commentMatch'>;
};

type BatchRepositories = {
  cases: FollowUpCases;
  continuousScreening: Pick<ContinuousScreeningRepository, 'reviewMatches'>;
};

export interface ScreeningReviewTentativeReviewInput extends ScreeningReviewDecisionInput {
  comment: string;
}

export type ScreeningReviewEscalateResult =
  | { ok: true; escalation: ScreeningReviewEscalation }
  | { ok: false; reason: ScreeningReviewRejection };

export interface ScreeningReviewBatchInput {
  caseId: string;
  decisions: Omit<ScreeningReviewDecisionInput, 'caseId'>[];
}

/** One result per decision, in order. `null`: the write failed unexpectedly and can be tried again. */
export type ScreeningReviewBatchResult = (ScreeningReviewDecisionResult | null)[];

type CloseRepositories = {
  cases: FollowUpCases;
  continuousScreening: Pick<ContinuousScreeningRepository, 'dismiss'>;
};

export interface ScreeningReviewCloseCaseInput {
  caseId: string;
  screeningId: string;
}

/**
 * The backend checks inbox access, not assignment, so a reassigned case would still accept a write.
 * Check the current state first; the backend also refuses hits that are no longer pending.
 */
function rejectionBeforeWrite(
  caseDetail: CaseDetail,
  userId: string,
  input: ScreeningReviewDecisionInput,
): ScreeningReviewRejection | null {
  if (caseDetail.status === 'closed') return 'unavailable';
  if (caseDetail.assignedTo !== userId) return 'reassigned';
  const screening = caseDetail.continuousScreenings.find(({ id }) => id === input.screeningId);
  const match = screening?.matches.find(({ id }) => id === input.matchId);
  if (!screening || !match) return 'unavailable';
  if (screening.status !== 'in_review') return 'not_in_review';
  if (match.status !== 'pending') return 'already_reviewed';
  return null;
}

/** The checks of `rejectionBeforeWrite`, for ending a screening with no pending hit left. */
function rejectionBeforeClose(
  caseDetail: CaseDetail,
  userId: string,
  input: ScreeningReviewCloseCaseInput,
): ScreeningReviewRejection | null {
  if (caseDetail.status === 'closed') return 'unavailable';
  if (caseDetail.assignedTo !== userId) return 'reassigned';
  const screening = caseDetail.continuousScreenings.find(({ id }) => id === input.screeningId);
  if (!screening) return 'unavailable';
  if (screening.status !== 'in_review') return 'not_in_review';
  if (screening.matches.some((match) => match.status === 'pending')) return 'not_closable';
  // A partial screening stays in review after a Hit; dismissing it would close the case as a false positive.
  if (screening.matches.some((match) => match.status === 'confirmed_hit')) return 'not_closable';
  const othersOpen = caseDetail.continuousScreenings.some(
    ({ id, status }) => id !== input.screeningId && status !== 'no_hit',
  );
  return othersOpen ? 'not_closable' : null;
}

/** The refusal behind an API status, as the single and batch reviews answer it. */
function rejectionFromStatus(status: number, message: string | null | undefined): ScreeningReviewRejection | null {
  if (status === NOT_FOUND) return 'unavailable';
  if (status === FORBIDDEN) return 'forbidden';
  if (status === UNPROCESSABLE_ENTITY) {
    return message?.includes('not pending review') ? 'already_reviewed' : 'not_in_review';
  }
  return null;
}

function rejectionFromError(error: unknown): ScreeningReviewRejection | null {
  return isHttpError(error) ? rejectionFromStatus(error.status, marbleApiErrorMessage(error)) : null;
}

/** A catch that turns failures into an outcome calls this first: a sign-in redirect must reach the client. */
function rethrowRedirect(error: unknown) {
  if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
}

/** Closes a case whose screenings all ended at `no_hit`. Returns whether the case is closed. */
export async function closeFalsePositiveCase(
  cases: Pick<CaseRepository, 'updateCase'>,
  caseDetail: CaseDetail,
): Promise<boolean> {
  if (!needsFalsePositiveClosure(caseDetail)) return caseDetail.status === 'closed';
  try {
    await cases.updateCase({ caseId: caseDetail.id, body: { status: 'closed', outcome: 'false_positive' } });
    return true;
  } catch (error) {
    rethrowRedirect(error);
    // Not atomic with the review: the next page load retries.
    return false;
  }
}

/** The refusals the backend's escalation answers with 422, told apart by their message. */
const ESCALATION_REFUSALS = [
  ['does not have escalation configured', 'no_escalation_inbox'],
  ['target inbox is inactive', 'inactive_escalation_inbox'],
  ['already closed', 'case_closed'],
] as const;

const escalationQueues = new Map<string, Promise<void>>();

function enqueueEscalation<T>(caseId: string, run: () => Promise<T>): Promise<T> {
  const previous = escalationQueues.get(caseId) ?? Promise.resolve();
  const result = previous.then(run, run);
  const settled = result.then(
    () => undefined,
    () => undefined,
  );
  escalationQueues.set(caseId, settled);
  void settled.finally(() => {
    if (escalationQueues.get(caseId) === settled) escalationQueues.delete(caseId);
  });
  return result;
}

async function escalateCase(
  cases: Pick<CaseRepository, 'getCase' | 'escalateCase'>,
  caseId: string,
  expectedInboxId: string,
): Promise<ScreeningReviewEscalation | undefined> {
  return enqueueEscalation(caseId, async () => {
    let current: CaseDetail;
    try {
      current = await cases.getCase({ caseId });
    } catch (error) {
      rethrowRedirect(error);
      if (isForbiddenHttpError(error) || isNotFoundHttpError(error)) return undefined;
      return 'failed';
    }
    if (current.inboxId !== expectedInboxId) return undefined;
    try {
      await cases.escalateCase({ caseId });
      return 'escalated';
    } catch (error) {
      rethrowRedirect(error);
      if (!isHttpError(error) || error.status !== UNPROCESSABLE_ENTITY) return 'failed';
      const message = marbleApiErrorMessage(error) ?? '';
      return ESCALATION_REFUSALS.find(([fragment]) => message.includes(fragment))?.[1] ?? 'failed';
    }
  });
}

export async function followUpScreeningReviewCase(cases: FollowUpCases, caseDetail: CaseDetail, userId: string) {
  switch (screeningReviewCaseFollowUp(caseDetail, userId)) {
    case 'close':
      return { caseClosed: await closeFalsePositiveCase(cases, caseDetail) };
    case 'escalate': {
      const escalation = await escalateCase(cases, caseDetail.id, caseDetail.inboxId);
      return { caseClosed: false, ...(escalation ? { escalation } : {}) };
    }
    case 'none':
      return { caseClosed: caseDetail.status === 'closed' };
  }
}

/**
 * Writes one decision, then closes the case when the screening reached `no_hit`. Closure follows the
 * write's completion, so a delayed write doesn't change it.
 */
export async function reviewScreeningReviewMatch(
  repositories: Repositories,
  userId: string,
  input: ScreeningReviewDecisionInput,
): Promise<ScreeningReviewDecisionResult> {
  try {
    const before = await repositories.cases.getCase({ caseId: input.caseId });
    const rejection = rejectionBeforeWrite(before, userId, input);
    if (rejection) return { ok: false, reason: rejection };
    await repositories.continuousScreening.updateMatchStatus({
      matchId: input.matchId,
      status: input.status,
      ...(input.comment?.trim() ? { comment: input.comment.trim() } : {}),
    });
  } catch (error) {
    const reason = rejectionFromError(error);
    if (reason) return { ok: false, reason };
    throw error;
  }

  return resultAfterWrite(repositories.cases, userId, input.caseId, input.screeningId);
}

export async function submitScreeningReviewTentativeReview(
  repositories: TentativeReviewRepositories,
  userId: string,
  input: ScreeningReviewTentativeReviewInput,
): Promise<ScreeningReviewDecisionResult> {
  try {
    const before = await repositories.cases.getCase({ caseId: input.caseId });
    const rejection = rejectionBeforeWrite(before, userId, input);
    if (rejection) return { ok: false, reason: rejection };
    await repositories.continuousScreening.commentMatch({
      matchId: input.matchId,
      comment: input.comment.trim(),
      tentativeReview: { status: input.status },
    });
  } catch (error) {
    const reason = rejectionFromError(error);
    if (reason) return { ok: false, reason };
    throw error;
  }

  return resultAfterWrite(repositories.cases, userId, input.caseId, input.screeningId);
}

/**
 * Reads the case back after a write, then closes or escalates it as it calls for.
 * `undefined` when the case couldn't be read back: the next load recovers.
 */
async function readBack(cases: FollowUpCases, userId: string, caseId: string) {
  let caseDetail: CaseDetail;
  try {
    caseDetail = await cases.getCase({ caseId });
  } catch (error) {
    rethrowRedirect(error);
    return undefined;
  }
  return { caseDetail, ...(await followUpScreeningReviewCase(cases, caseDetail, userId)) };
}

async function resultAfterWrite(
  cases: FollowUpCases,
  userId: string,
  caseId: string,
  screeningId: string,
): Promise<ScreeningReviewDecisionResult> {
  const after = await readBack(cases, userId, caseId);
  if (!after) return { ok: true, screeningStatus: null, caseClosed: false };
  const screeningStatus = after.caseDetail.continuousScreenings.find(({ id }) => id === screeningId)?.status ?? null;
  return {
    ok: true,
    screeningStatus,
    caseClosed: after.caseClosed,
    ...(after.escalation ? { escalation: after.escalation } : {}),
  };
}

/**
 * Writes the decisions of one case in one request, each like `reviewScreeningReviewMatch`: the case is
 * read once before and once after, and closed once when its screenings all ended at `no_hit`.
 */
export async function reviewScreeningReviewMatches(
  repositories: BatchRepositories,
  userId: string,
  { caseId, decisions }: ScreeningReviewBatchInput,
): Promise<ScreeningReviewBatchResult> {
  const outcomes: (ScreeningReviewRejection | 'written' | 'failed')[] = [];
  try {
    const before = await repositories.cases.getCase({ caseId });
    const toWrite: number[] = [];
    decisions.forEach((decision, index) => {
      const rejection = rejectionBeforeWrite(before, userId, { ...decision, caseId });
      outcomes[index] = rejection ?? 'written';
      if (!rejection) toWrite.push(index);
    });
    if (toWrite.length) {
      const results = await repositories.continuousScreening.reviewMatches(
        toWrite.map((index) => {
          const { matchId, status, comment } = decisions[index]!;
          return { matchId, status, ...(comment?.trim() ? { comment: comment.trim() } : {}) };
        }),
      );
      toWrite.forEach((index, position) => {
        const result = results[position];
        if (result?.statusCode === OK) return;
        outcomes[index] = (result && rejectionFromStatus(result.statusCode, result.message)) ?? 'failed';
      });
    }
  } catch (error) {
    const reason = rejectionFromError(error);
    if (reason) return decisions.map(() => ({ ok: false, reason }));
    throw error;
  }

  const after = outcomes.includes('written') ? await readBack(repositories.cases, userId, caseId) : undefined;
  return decisions.map((decision, index): ScreeningReviewDecisionResult | null => {
    const outcome = outcomes[index]!;
    if (outcome === 'failed') return null;
    if (outcome !== 'written') return { ok: false, reason: outcome };
    return {
      ok: true,
      screeningStatus:
        after?.caseDetail.continuousScreenings.find(({ id }) => id === decision.screeningId)?.status ?? null,
      caseClosed: after?.caseClosed ?? false,
      ...(after?.escalation ? { escalation: after.escalation } : {}),
    };
  });
}

/**
 * Ends a partial screening whose loaded hits are all decided at `no_hit`, without loading its other
 * matches, then closes the case as a false positive. Dismiss needs the admin permission.
 */
export async function closeScreeningReviewCase(
  repositories: CloseRepositories,
  userId: string,
  input: ScreeningReviewCloseCaseInput,
): Promise<ScreeningReviewDecisionResult> {
  try {
    const before = await repositories.cases.getCase({ caseId: input.caseId });
    const rejection = rejectionBeforeClose(before, userId, input);
    if (rejection) return { ok: false, reason: rejection };
    await repositories.continuousScreening.dismiss(input.screeningId);
  } catch (error) {
    const reason = rejectionFromError(error);
    if (reason) return { ok: false, reason };
    throw error;
  }
  return resultAfterWrite(repositories.cases, userId, input.caseId, input.screeningId);
}

function hasHitsToReview(caseDetail: CaseDetail) {
  return caseDetail.continuousScreenings.some(
    (screening) =>
      screening.status === 'in_review' &&
      screening.matches.some(
        (match) => match.status === 'pending' && match.tentativeReview?.inboxId !== caseDetail.inboxId,
      ),
  );
}

function hasTentativeReviewToEscalate(caseDetail: CaseDetail) {
  return caseDetail.continuousScreenings.some(
    (screening) =>
      screening.status === 'in_review' &&
      screening.matches.some(
        (match) => match.status === 'pending' && match.tentativeReview?.inboxId === caseDetail.inboxId,
      ),
  );
}

export async function escalateScreeningReviewCase(
  cases: Pick<CaseRepository, 'getCase' | 'escalateCase'>,
  userId: string,
  { caseId }: { caseId: string },
): Promise<ScreeningReviewEscalateResult> {
  try {
    const before = await cases.getCase({ caseId });
    if (before.status === 'closed') return { ok: false, reason: 'unavailable' };
    if (before.assignedTo !== userId) return { ok: false, reason: 'reassigned' };
    if (!hasTentativeReviewToEscalate(before) || hasHitsToReview(before))
      return { ok: false, reason: 'not_escalatable' };
    const escalation = await escalateCase(cases, caseId, before.inboxId);
    if (!escalation) return { ok: false, reason: 'not_escalatable' };
    return { ok: true, escalation };
  } catch (error) {
    const reason = rejectionFromError(error);
    if (reason) return { ok: false, reason };
    throw error;
  }
}
