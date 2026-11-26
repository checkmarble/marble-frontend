import {
  objectReviewScreening,
  reviewCase,
  withMatchStatus,
  withTentativeReview,
} from '@app-builder/models/screening-review.test-helpers';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import type { ContinuousScreeningRepository } from '@app-builder/repositories/ContinuousScreeningRepository';
import { describe, expect, it, vi } from 'vitest';
import {
  closeScreeningReviewCase,
  escalateScreeningReviewCase,
  followUpScreeningReviewCase,
  reviewScreeningReviewMatch,
  reviewScreeningReviewMatches,
  type ScreeningReviewDecisionInput,
  submitScreeningReviewTentativeReview,
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
      escalateCase: vi.fn<CaseRepository['escalateCase']>(),
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
        escalateCase: vi.fn<CaseRepository['escalateCase']>(),
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
        escalateCase: vi.fn<CaseRepository['escalateCase']>(),
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
    [
      'not_closable',
      reviewCase('case', [
        {
          ...decidedPartial(),
          matches: decidedPartial().matches.map((match, index) =>
            index === 0 ? { ...match, status: 'confirmed_hit' as const } : match,
          ),
        },
      ]),
    ],
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
      escalateCase: vi.fn<CaseRepository['escalateCase']>(),
      updateCase: vi.fn<CaseRepository['updateCase']>().mockRejectedValue(new Error('still failing')),
    };
    expect(await readScreeningReviewPage(repository, 'analyst', 50, null)).toEqual({
      items: [],
      nextCursor: null,
      failed: false,
      // The closure failed again, so the case stays open.
      closedCaseIds: [],
      escalations: [],
    });
    expect(repository.updateCase).toHaveBeenCalledExactlyOnceWith({
      caseId: 'case',
      body: { status: 'closed', outcome: 'false_positive' },
    });
  });
});

describe('screening review tentative review', () => {
  const tentativeInput = { ...input, status: 'confirmed_hit' as const, comment: '  Same birth year, unsure  ' };
  const escalating = reviewCase('case', [
    withMatchStatus(withTentativeReview(objectReviewScreening(), 'screening-1-high'), 'no_hit', ['screening-1-low']),
  ]);
  function tentativeRepositories(before = reviewCase('case'), after = before) {
    return {
      cases: {
        getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValueOnce(before).mockResolvedValue(after),
        escalateCase: vi.fn<CaseRepository['escalateCase']>().mockResolvedValue(undefined),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
      },
      continuousScreening: {
        commentMatch: vi.fn<ContinuousScreeningRepository['commentMatch']>().mockResolvedValue(undefined),
        updateMatchStatus: vi.fn<ContinuousScreeningRepository['updateMatchStatus']>().mockResolvedValue(undefined),
      },
    };
  }
  type TentativeRepositories = ReturnType<typeof tentativeRepositories>;

  it('writes the trimmed comment with the tentative status, and leaves the case while a hit is to review', async () => {
    const repos = tentativeRepositories(
      reviewCase('case'),
      reviewCase('case', [withTentativeReview(objectReviewScreening(), 'screening-1-high')]),
    );
    expect(await submitScreeningReviewTentativeReview(repos, 'analyst', tentativeInput)).toEqual({
      ok: true,
      screeningStatus: 'in_review',
      caseClosed: false,
    });
    expect(repos.continuousScreening.commentMatch).toHaveBeenCalledExactlyOnceWith({
      matchId: 'screening-1-high',
      comment: 'Same birth year, unsure',
      tentativeReview: { status: 'confirmed_hit' },
    });
    expect(repos.cases.escalateCase).not.toHaveBeenCalled();
  });

  it.each([
    [
      'a tentative review',
      (repos: TentativeRepositories) => submitScreeningReviewTentativeReview(repos, 'analyst', tentativeInput),
    ],
    [
      'a final decision',
      (repos: TentativeRepositories) =>
        reviewScreeningReviewMatch(repos, 'analyst', { ...input, matchId: 'screening-1-low' }),
    ],
  ] as const)('escalates the case once %s leaves nothing to review', async (_, write) => {
    const repos = tentativeRepositories(reviewCase('case'), escalating);
    expect(await write(repos)).toEqual({
      ok: true,
      screeningStatus: 'in_review',
      caseClosed: false,
      escalation: 'escalated',
    });
    expect(repos.cases.escalateCase).toHaveBeenCalledExactlyOnceWith({ caseId: 'case' });
    expect(repos.cases.updateCase).not.toHaveBeenCalled();
  });

  it.each([
    ['no_escalation_inbox', httpError(422, 'the source inbox does not have escalation configured')],
    ['inactive_escalation_inbox', httpError(422, 'target inbox is inactive')],
    ['case_closed', httpError(422, 'case is already closed, cannot escalate')],
    ['failed', httpError(422, 'something else')],
    ['failed', new Error('network')],
  ] as const)('reports an escalation that could not be made: %s', async (escalation, error) => {
    const repos = tentativeRepositories(reviewCase('case'), escalating);
    repos.cases.escalateCase.mockRejectedValue(error);
    expect(await submitScreeningReviewTentativeReview(repos, 'analyst', tentativeInput)).toMatchObject({
      ok: true,
      escalation,
    });
  });

  it('lets a sign-in redirect through instead of reporting a failed escalation', async () => {
    const repos = tentativeRepositories(reviewCase('case'), escalating);
    const signIn = new Response(null, { status: 302, headers: { Location: '/sign-in' } });
    repos.cases.escalateCase.mockRejectedValue(signIn);
    await expect(submitScreeningReviewTentativeReview(repos, 'analyst', tentativeInput)).rejects.toBe(signIn);
  });

  it('refuses a hit that is no longer pending, like a decision', async () => {
    const reviewed = withMatchStatus(objectReviewScreening(), 'no_hit', ['screening-1-high']);
    const repos = tentativeRepositories(reviewCase('case', [reviewed]));
    expect(await submitScreeningReviewTentativeReview(repos, 'analyst', tentativeInput)).toEqual({
      ok: false,
      reason: 'already_reviewed',
    });
    expect(repos.continuousScreening.commentMatch).not.toHaveBeenCalled();
  });
});

describe('screening review case escalation', () => {
  const partial = reviewCase('case', [
    {
      ...withMatchStatus(withTentativeReview(objectReviewScreening(), 'screening-1-high'), 'no_hit', [
        'screening-1-low',
      ]),
      partial: true,
    },
  ]);

  it.each([
    ['a partial screening with its loaded hits done', partial, { ok: true, escalation: 'escalated' }],
    ['a closed case', { ...partial, status: 'closed' as const }, { ok: false, reason: 'unavailable' }],
    ['a case assigned to someone else', { ...partial, assignedTo: 'colleague' }, { ok: false, reason: 'reassigned' }],
    [
      'a case without a tentative review',
      reviewCase('case', [{ ...withMatchStatus(objectReviewScreening(), 'no_hit'), partial: true }]),
      { ok: false, reason: 'not_escalatable' },
    ],
    [
      'a case with a hit to review',
      reviewCase('case', [withTentativeReview(objectReviewScreening(), 'screening-1-high')]),
      { ok: false, reason: 'not_escalatable' },
    ],
  ] as const)('escalates or refuses %s', async (_, before, expected) => {
    const cases = {
      getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValue(before),
      escalateCase: vi.fn<CaseRepository['escalateCase']>().mockResolvedValue(undefined),
    };
    expect(await escalateScreeningReviewCase(cases, 'analyst', { caseId: 'case' })).toEqual(expected);
    expect(cases.escalateCase).toHaveBeenCalledTimes(expected.ok ? 1 : 0);
  });
});

describe('escalation recovery on load', () => {
  const leftAssigned = reviewCase('case', [
    withMatchStatus(withTentativeReview(objectReviewScreening(), 'screening-1-high'), 'no_hit', ['screening-1-low']),
  ]);

  it.each([
    ['escalated', undefined, []],
    ['inactive_escalation_inbox', httpError(422, 'target inbox is inactive'), ['screening-1-high', 'screening-1-low']],
  ] as const)(
    'retries an escalation left undone, and lists the case only if it fails: %s',
    async (escalation, error, listed) => {
      const repository = {
        listCases: vi
          .fn<CaseRepository['listCases']>()
          .mockResolvedValue({ items: [leftAssigned], hasNextPage: false }),
        getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValue(leftAssigned),
        escalateCase: vi.fn<CaseRepository['escalateCase']>(async () => {
          if (error) throw error;
        }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
      };
      const page = await readScreeningReviewPage(repository, 'analyst', 50, null, { filter: 'all' });
      expect(page.escalations).toEqual([{ caseId: 'case', inboxId: 'inbox', escalation }]);
      expect(page.items.map((item) => item.matchId)).toEqual(listed);
      expect(repository.escalateCase).toHaveBeenCalledExactlyOnceWith({ caseId: 'case' });
      expect(repository.updateCase).not.toHaveBeenCalled();
    },
  );

  it('does not escalate a case that left the inbox the page read', async () => {
    const repository = {
      listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: [leftAssigned], hasNextPage: false }),
      getCase: vi
        .fn<CaseRepository['getCase']>()
        .mockResolvedValueOnce(leftAssigned)
        .mockResolvedValueOnce({ ...leftAssigned, inboxId: 'second-review' }),
      escalateCase: vi.fn<CaseRepository['escalateCase']>(),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
    };
    const page = await readScreeningReviewPage(repository, 'analyst', 50, null, { filter: 'all' });
    expect(repository.escalateCase).not.toHaveBeenCalled();
    expect(page.escalations).toEqual([]);
  });
});

describe('overlapping escalation follow-ups', () => {
  const ready = reviewCase('case', [
    withMatchStatus(withTentativeReview(objectReviewScreening(), 'screening-1-high'), 'no_hit', ['screening-1-low']),
  ]);

  it('escalates once when a write and a page load both follow up the same case', async () => {
    let current = ready;
    const cases = {
      getCase: vi.fn<CaseRepository['getCase']>(async () => current),
      escalateCase: vi.fn<CaseRepository['escalateCase']>(async () => {
        current = { ...current, inboxId: 'second-review' };
      }),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
    };
    const [first, second] = await Promise.all([
      followUpScreeningReviewCase(cases, ready, 'analyst'),
      followUpScreeningReviewCase(cases, ready, 'analyst'),
    ]);
    expect(cases.escalateCase).toHaveBeenCalledExactlyOnceWith({ caseId: 'case' });
    expect([first.escalation, second.escalation].filter((escalation) => escalation === 'escalated')).toHaveLength(1);
    expect([first.escalation, second.escalation].filter((escalation) => escalation === undefined)).toHaveLength(1);
  });
});
