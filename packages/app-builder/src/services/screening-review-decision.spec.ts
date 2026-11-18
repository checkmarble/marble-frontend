import { objectReviewScreening, reviewCase } from '@app-builder/models/screening-review.test-helpers';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import type { ContinuousScreeningRepository } from '@app-builder/repositories/ContinuousScreeningRepository';
import { describe, expect, it, vi } from 'vitest';
import {
  closeScreeningReviewCase,
  reviewScreeningReviewMatch,
  reviewScreeningReviewMatches,
  type ScreeningReviewDecisionInput,
} from './screening-review-decision';
import { readScreeningReviewPage } from './screening-review-page';

const input: ScreeningReviewDecisionInput = {
  caseId: 'case',
  screeningId: 'screening-1',
  matchId: 'screening-1-high',
  status: 'no_hit',
  comment: '  Different birth date  ',
};

function httpError(status: number, message = 'error') {
  return Object.assign(new Error(message), { status, data: { message } });
}

function repositories(before = reviewCase('case'), after = before) {
  return {
    cases: {
      getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValueOnce(before).mockResolvedValueOnce(after),
      updateCase: vi.fn<CaseRepository['updateCase']>().mockResolvedValue(after),
    },
    continuousScreening: {
      updateMatchStatus: vi.fn<ContinuousScreeningRepository['updateMatchStatus']>().mockResolvedValue(undefined),
    },
  };
}

function finished(status: 'no_hit' | 'confirmed_hit') {
  return reviewCase('case', [{ ...objectReviewScreening(), status }]);
}

describe('screening review decision', () => {
  it('writes the decision with a trimmed comment, then closes the case as a false positive at no_hit', async () => {
    const repos = repositories(reviewCase('case'), finished('no_hit'));
    expect(await reviewScreeningReviewMatch(repos, 'analyst', input)).toEqual({
      ok: true,
      screeningStatus: 'no_hit',
      caseClosed: true,
    });
    expect(repos.continuousScreening.updateMatchStatus).toHaveBeenCalledExactlyOnceWith({
      matchId: 'screening-1-high',
      status: 'no_hit',
      comment: 'Different birth date',
    });
    expect(repos.cases.updateCase).toHaveBeenCalledExactlyOnceWith({
      caseId: 'case',
      body: { status: 'closed', outcome: 'false_positive' },
    });
  });

  it.each([
    ['in_review', reviewCase('case')],
    ['confirmed_hit', finished('confirmed_hit')],
  ] as const)('leaves the case open when the screening is %s', async (screeningStatus, after) => {
    const repos = repositories(reviewCase('case'), after);
    expect(await reviewScreeningReviewMatch(repos, 'analyst', { ...input, comment: ' ' })).toEqual({
      ok: true,
      screeningStatus,
      caseClosed: false,
    });
    expect(repos.continuousScreening.updateMatchStatus.mock.calls[0]?.[0]).not.toHaveProperty('comment');
    expect(repos.cases.updateCase).not.toHaveBeenCalled();
  });

  it('reports a failed closure as an open case, so the next load retries it', async () => {
    const repos = repositories(reviewCase('case'), finished('no_hit'));
    repos.cases.updateCase.mockRejectedValue(new Error('network'));
    expect(await reviewScreeningReviewMatch(repos, 'analyst', input)).toEqual({
      ok: true,
      screeningStatus: 'no_hit',
      caseClosed: false,
    });
  });

  it('keeps a successful write when the screening cannot be read back', async () => {
    const repos = repositories();
    repos.cases.getCase.mockReset().mockResolvedValueOnce(reviewCase('case')).mockRejectedValueOnce(new Error('x'));
    expect(await reviewScreeningReviewMatch(repos, 'analyst', input)).toEqual({
      ok: true,
      screeningStatus: null,
      caseClosed: false,
    });
  });

  const reviewed = objectReviewScreening();
  reviewed.matches[0]!.status = 'no_hit';
  it.each([
    ['unavailable', reviewCase('case', undefined, { status: 'closed' })],
    ['reassigned', reviewCase('case', undefined, { assignedTo: 'colleague' })],
    ['unavailable', reviewCase('case', [objectReviewScreening('other-screening')])],
    ['not_in_review', reviewCase('case', [{ ...objectReviewScreening(), status: 'confirmed_hit' }])],
    ['already_reviewed', reviewCase('case', [reviewed])],
  ] as const)('refuses before writing: %s', async (reason, before) => {
    const repos = repositories(before);
    expect(await reviewScreeningReviewMatch(repos, 'analyst', input)).toEqual({ ok: false, reason });
    expect(repos.continuousScreening.updateMatchStatus).not.toHaveBeenCalled();
  });

  it.each([
    ['unavailable', httpError(404)],
    ['forbidden', httpError(403)],
    ['not_in_review', httpError(422, 'continuous screening is not in review')],
    ['already_reviewed', httpError(422, 'continuous screening match is not pending review')],
  ] as const)('maps a refused write to %s', async (reason, error) => {
    const repos = repositories();
    repos.continuousScreening.updateMatchStatus.mockRejectedValue(error);
    expect(await reviewScreeningReviewMatch(repos, 'analyst', input)).toEqual({ ok: false, reason });
    expect(repos.cases.updateCase).not.toHaveBeenCalled();
  });

  it('maps a forbidden case read and rethrows unexpected failures', async () => {
    const forbidden = repositories();
    forbidden.cases.getCase.mockReset().mockRejectedValue(httpError(403));
    expect(await reviewScreeningReviewMatch(forbidden, 'analyst', input)).toEqual({ ok: false, reason: 'forbidden' });
    const failing = repositories();
    failing.continuousScreening.updateMatchStatus.mockRejectedValue(new Error('network'));
    await expect(reviewScreeningReviewMatch(failing, 'analyst', input)).rejects.toThrow('network');
  });
});

describe('screening review batch decision', () => {
  const decision = (matchId: string, comment?: string) => ({
    screeningId: 'screening-1',
    matchId,
    status: 'no_hit' as const,
    ...(comment ? { comment } : {}),
  });
  function batchRepositories(before = reviewCase('case'), after = finished('no_hit')) {
    return {
      cases: {
        getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValueOnce(before).mockResolvedValueOnce(after),
        updateCase: vi.fn<CaseRepository['updateCase']>().mockResolvedValue(after),
      },
      continuousScreening: {
        reviewMatches: vi
          .fn<ContinuousScreeningRepository['reviewMatches']>()
          .mockImplementation(async (matches) => matches.map(({ matchId }) => ({ matchId, statusCode: 200 }))),
      },
    };
  }

  it('writes every decision in one request, reads the case once after, and closes it once', async () => {
    const repos = batchRepositories();
    const [high, low] = objectReviewScreening().matches;
    expect(
      await reviewScreeningReviewMatches(repos, 'analyst', {
        caseId: 'case',
        decisions: [decision(high!.id, '  Different birth date  '), decision(low!.id, ' ')],
      }),
    ).toEqual([
      { ok: true, screeningStatus: 'no_hit', caseClosed: true },
      { ok: true, screeningStatus: 'no_hit', caseClosed: true },
    ]);
    expect(repos.continuousScreening.reviewMatches).toHaveBeenCalledExactlyOnceWith([
      { matchId: high!.id, status: 'no_hit', comment: 'Different birth date' },
      { matchId: low!.id, status: 'no_hit' },
    ]);
    expect(repos.cases.getCase).toHaveBeenCalledTimes(2);
    expect(repos.cases.updateCase).toHaveBeenCalledOnce();
  });

  it('answers each decision on its own: refused before writing, refused by the API, or failed', async () => {
    const reviewed = objectReviewScreening();
    reviewed.matches[0]!.status = 'no_hit';
    const repos = batchRepositories(reviewCase('case', [reviewed]), reviewCase('case'));
    const [first, second] = reviewed.matches;
    repos.continuousScreening.reviewMatches.mockResolvedValue([
      { matchId: second!.id, statusCode: 422, message: 'continuous screening is not in review' },
    ]);
    expect(
      await reviewScreeningReviewMatches(repos, 'analyst', {
        caseId: 'case',
        decisions: [decision(first!.id), decision(second!.id)],
      }),
    ).toEqual([
      { ok: false, reason: 'already_reviewed' },
      { ok: false, reason: 'not_in_review' },
    ]);
    // Nothing was written, so the case isn't read back.
    expect(repos.cases.getCase).toHaveBeenCalledOnce();

    const failing = batchRepositories(reviewCase('case'), reviewCase('case'));
    failing.continuousScreening.reviewMatches.mockResolvedValue([
      { matchId: first!.id, statusCode: 200 },
      { matchId: second!.id, statusCode: 500, message: 'database' },
    ]);
    expect(
      await reviewScreeningReviewMatches(failing, 'analyst', {
        caseId: 'case',
        decisions: [decision(first!.id), decision(second!.id)],
      }),
    ).toEqual([{ ok: true, screeningStatus: 'in_review', caseClosed: false }, null]);
  });

  it('refuses every decision when the case is forbidden, and rethrows unexpected failures', async () => {
    const forbidden = batchRepositories();
    forbidden.cases.getCase.mockReset().mockRejectedValue(httpError(403));
    const decisions = [decision('screening-1-high'), decision('screening-1-low')];
    expect(await reviewScreeningReviewMatches(forbidden, 'analyst', { caseId: 'case', decisions })).toEqual([
      { ok: false, reason: 'forbidden' },
      { ok: false, reason: 'forbidden' },
    ]);
    const failing = batchRepositories();
    failing.continuousScreening.reviewMatches.mockRejectedValue(new Error('network'));
    await expect(reviewScreeningReviewMatches(failing, 'analyst', { caseId: 'case', decisions })).rejects.toThrow(
      'network',
    );
  });
});

describe('screening review case closure', () => {
  const closeInput = { caseId: 'case', screeningId: 'screening-1' };
  /** A partial screening whose loaded hits are all No hit. */
  function decidedPartial() {
    const screening = objectReviewScreening();
    screening.partial = true;
    screening.matches = screening.matches.map((match) => ({ ...match, status: 'no_hit' as const }));
    return screening;
  }
  function closeRepositories(before = reviewCase('case', [decidedPartial()]), after = finished('no_hit')) {
    return {
      cases: {
        getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValueOnce(before).mockResolvedValueOnce(after),
        updateCase: vi.fn<CaseRepository['updateCase']>().mockResolvedValue(after),
      },
      continuousScreening: { dismiss: vi.fn<ContinuousScreeningRepository['dismiss']>().mockResolvedValue(undefined) },
    };
  }

  it('dismisses the screening without loading its other matches, then closes the case as a false positive', async () => {
    const repos = closeRepositories();
    expect(await closeScreeningReviewCase(repos, 'analyst', closeInput)).toEqual({
      ok: true,
      screeningStatus: 'no_hit',
      caseClosed: true,
    });
    expect(repos.continuousScreening.dismiss).toHaveBeenCalledExactlyOnceWith('screening-1');
    expect(repos.cases.updateCase).toHaveBeenCalledExactlyOnceWith({
      caseId: 'case',
      body: { status: 'closed', outcome: 'false_positive' },
    });
  });

  const openOther = { ...objectReviewScreening('screening-2'), status: 'in_review' as const };
  it.each([
    ['unavailable', reviewCase('case', [decidedPartial()], { status: 'closed' })],
    ['reassigned', reviewCase('case', [decidedPartial()], { assignedTo: 'colleague' })],
    ['unavailable', reviewCase('case', [objectReviewScreening('other-screening')])],
    ['not_in_review', reviewCase('case', [{ ...decidedPartial(), status: 'confirmed_hit' }])],
    ['not_closable', reviewCase('case', [objectReviewScreening()])],
    ['not_closable', reviewCase('case', [decidedPartial(), openOther])],
  ] as const)('refuses before dismissing: %s', async (reason, before) => {
    const repos = closeRepositories(before);
    expect(await closeScreeningReviewCase(repos, 'analyst', closeInput)).toEqual({ ok: false, reason });
    expect(repos.continuousScreening.dismiss).not.toHaveBeenCalled();
  });

  it.each([
    ['forbidden', httpError(403)],
    ['not_in_review', httpError(422, "continuous screening is not in review, can't dismiss")],
  ] as const)('maps a refused dismiss to %s', async (reason, error) => {
    const repos = closeRepositories();
    repos.continuousScreening.dismiss.mockRejectedValue(error);
    expect(await closeScreeningReviewCase(repos, 'analyst', closeInput)).toEqual({ ok: false, reason });
    expect(repos.cases.updateCase).not.toHaveBeenCalled();
  });
});

describe('closure recovery on load', () => {
  it('closes a no_hit case left open by a failed closure and lists none of its hits', async () => {
    const leftOpen = finished('no_hit');
    const repository = {
      listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: [leftOpen], hasNextPage: false }),
      getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValue(leftOpen),
      updateCase: vi.fn<CaseRepository['updateCase']>().mockRejectedValue(new Error('still failing')),
    };
    expect(await readScreeningReviewPage(repository, 'analyst', 50, null)).toEqual({
      items: [],
      nextCursor: null,
      failed: false,
      // The closure failed again, so the case stays open.
      closedCaseIds: [],
    });
    expect(repository.updateCase).toHaveBeenCalledExactlyOnceWith({
      caseId: 'case',
      body: { status: 'closed', outcome: 'false_positive' },
    });
  });
});
