import type { CaseDetail } from '@app-builder/models/cases';
import type { ContinuousScreening } from '@app-builder/models/continuous-screening';
import {
  isForbiddenHttpError,
  isNotFoundHttpError,
  isUnprocessableEntityHttpError,
  marbleApiErrorMessage,
} from '@app-builder/models/http-errors';
import { needsFalsePositiveClosure, type ScreeningReviewDecision } from '@app-builder/models/screening-review';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import type { ContinuousScreeningRepository } from '@app-builder/repositories/ContinuousScreeningRepository';

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
  | 'already_reviewed';

export type ScreeningReviewDecisionResult =
  | {
      ok: true;
      /** `null` when the screening couldn't be read back. The next load recovers. */
      screeningStatus: ContinuousScreening['status'] | null;
      caseClosed: boolean;
    }
  | { ok: false; reason: ScreeningReviewRejection };

type Repositories = {
  cases: Pick<CaseRepository, 'getCase' | 'updateCase'>;
  continuousScreening: Pick<ContinuousScreeningRepository, 'updateMatchStatus'>;
};

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

function rejectionFromError(error: unknown): ScreeningReviewRejection | null {
  if (isNotFoundHttpError(error)) return 'unavailable';
  if (isForbiddenHttpError(error)) return 'forbidden';
  if (isUnprocessableEntityHttpError(error)) {
    return marbleApiErrorMessage(error)?.includes('not pending review') ? 'already_reviewed' : 'not_in_review';
  }
  return null;
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
  } catch {
    // Not atomic with the review: the next page load retries.
    return false;
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

  let after: CaseDetail;
  try {
    after = await repositories.cases.getCase({ caseId: input.caseId });
  } catch {
    return { ok: true, screeningStatus: null, caseClosed: false };
  }
  const screeningStatus = after.continuousScreenings.find(({ id }) => id === input.screeningId)?.status ?? null;
  return { ok: true, screeningStatus, caseClosed: await closeFalsePositiveCase(repositories.cases, after) };
}
