import { describe, expect, it } from 'vitest';
import { type ContinuousScreeningMatch, getPendingTentativeReviews } from './continuous-screening';
import { adaptScreeningMatchComments, type ScreeningMatchTentativeReview } from './screening';

function tentativeReview(id: string): ScreeningMatchTentativeReview {
  return {
    id,
    authorId: 'user-1',
    comment: 'Looks like the same person',
    status: 'confirmed_hit',
    inboxId: 'inbox-1',
    createdAt: '2026-11-20T10:00:00Z',
  };
}

function screeningMatch(
  id: string,
  status: ContinuousScreeningMatch['status'],
  review: ScreeningMatchTentativeReview | null,
): ContinuousScreeningMatch {
  return {
    id,
    continuousScreeningId: 'screening-1',
    opensanctionEntityId: `entity-${id}`,
    status,
    payload: {
      id: `entity-${id}`,
      schema: 'Person',
      caption: id,
      properties: {},
      score: 0.9,
      datasets: [],
      target: true,
    } as unknown as ContinuousScreeningMatch['payload'],
    comments: [],
    tentativeReview: review,
  };
}

describe('getPendingTentativeReviews', () => {
  it('lists only the tentative reviews of pending hits', () => {
    const matches = [
      screeningMatch('pending-with-review', 'pending', tentativeReview('review-1')),
      screeningMatch('pending-without-review', 'pending', null),
      screeningMatch('decided-with-review', 'no_hit', tentativeReview('review-2')),
    ];

    expect(getPendingTentativeReviews(matches).map(({ review }) => review.id)).toEqual(['review-1']);
  });
});

describe('adaptScreeningMatchComments', () => {
  it('keeps the replaced tentative review a comment carried', () => {
    const [plain, replaced] = adaptScreeningMatchComments([
      { id: 'comment-1', author_id: 'user-1', comment: 'Plain', created_at: '2026-11-19T10:00:00Z' },
      {
        id: 'comment-2',
        author_id: 'user-1',
        comment: 'First opinion',
        created_at: '2026-11-19T11:00:00Z',
        tentative_review: { status: 'no_hit', superseded_at: '2026-11-20T10:00:00Z' },
      },
    ]);

    expect(plain).not.toHaveProperty('tentativeReview');
    expect(replaced?.tentativeReview).toEqual({ status: 'no_hit', supersededAt: '2026-11-20T10:00:00Z' });
  });
});
