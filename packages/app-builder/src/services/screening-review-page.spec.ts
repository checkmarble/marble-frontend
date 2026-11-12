import type { Case } from '@app-builder/models/cases';
import {
  datasetReviewScreening,
  objectReviewScreening,
  reviewCase,
} from '@app-builder/models/screening-review.test-helpers';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import { describe, expect, it, vi } from 'vitest';
import { readScreeningReviewPage } from './screening-review-page';

describe('assigned screening review page reader', () => {
  it('scopes every scanned case page to the selected inbox while retaining analyst assignment', async () => {
    const detail = reviewCase('monitoring', undefined, { inboxId: 'selected-inbox' });
    const repository = {
      listCases: vi
        .fn<CaseRepository['listCases']>()
        .mockResolvedValueOnce({ items: [reviewCase('decision', [], { type: 'decision' })], hasNextPage: true })
        .mockResolvedValueOnce({ items: [detail], hasNextPage: false }),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
      getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValue(detail),
    };
    const result = await readScreeningReviewPage(repository, 'analyst', 50, null, { inboxId: 'selected-inbox' });
    expect(result.items).toHaveLength(2);
    expect(repository.listCases).toHaveBeenCalledTimes(2);
    for (const [filters] of repository.listCases.mock.calls) {
      expect(filters).toMatchObject({
        inboxIds: ['selected-inbox'],
        assigneeId: 'analyst',
        type: ['continuous_screening'],
      });
    }
  });

  it('keeps My inbox across all inboxes without a server inbox filter', async () => {
    const first = reviewCase('first', undefined, { inboxId: 'first-inbox' });
    const second = reviewCase('second', undefined, { inboxId: 'second-inbox' });
    const repository = {
      listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: [first, second], hasNextPage: false }),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
      getCase: vi
        .fn<CaseRepository['getCase']>()
        .mockImplementation(async ({ caseId }) => (caseId === first.id ? first : second)),
    };
    const result = await readScreeningReviewPage(repository, 'analyst', 50, null, { inboxId: 'my-inbox' });
    expect(result.items).toHaveLength(4);
    expect(repository.listCases.mock.calls[0]?.[0].inboxIds).toBeUndefined();
  });

  it('excludes a case moved out of the selected inbox between list and detail requests', async () => {
    const summary = reviewCase('moved', undefined, { inboxId: 'selected-inbox' });
    const result = await readScreeningReviewPage(
      {
        listCases: async () => ({ items: [summary], hasNextPage: false }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
        getCase: async () => ({ ...summary, inboxId: 'other-inbox' }),
      },
      'analyst',
      50,
      null,
      { inboxId: 'selected-inbox' },
    );
    expect(result.items).toEqual([]);
  });

  it.each([objectReviewScreening(), datasetReviewScreening()])(
    'scans past decision-only pages and preserves every $triggerType hit',
    async (screening) => {
      const detail = reviewCase('monitoring', [screening, { ...screening, id: 'second-screening' }]);
      const repository = {
        listCases: vi
          .fn<CaseRepository['listCases']>()
          .mockResolvedValueOnce({ items: [reviewCase('decision', [], { type: 'decision' })], hasNextPage: true })
          .mockResolvedValueOnce({ items: [detail], hasNextPage: false }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
        getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValue(detail),
      };
      const result = await readScreeningReviewPage(repository, 'analyst', 50, null);
      expect(result.items).toHaveLength(4);
      expect(result).toMatchObject({ nextCursor: null, failed: false });
      expect(repository.getCase).toHaveBeenCalledExactlyOnceWith({ caseId: 'monitoring' });
      expect(repository.listCases).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          offsetId: 'decision',
          assigneeId: 'analyst',
          snoozed: false,
          statuses: ['pending', 'investigating', 'waiting_for_action'],
        }),
      );
    },
  );

  it('continues past monitoring cases with no pending hits', async () => {
    const reviewed = reviewCase('reviewed', [{ ...objectReviewScreening(), status: 'confirmed_hit' }]);
    const pending = reviewCase('pending');
    const repository = {
      listCases: vi
        .fn<CaseRepository['listCases']>()
        .mockResolvedValueOnce({ items: [reviewed], hasNextPage: true })
        .mockResolvedValueOnce({ items: [pending], hasNextPage: false }),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
      getCase: vi
        .fn<CaseRepository['getCase']>()
        .mockImplementation(async ({ caseId }) => (caseId === reviewed.id ? reviewed : pending)),
    };
    expect((await readScreeningReviewPage(repository, 'analyst', 50, null)).items).toHaveLength(4);
    expect(repository.listCases).toHaveBeenCalledTimes(2);
  });

  it('keeps whole cases and advances by the last scanned raw case, with bounded concurrency', async () => {
    const cases = Array.from({ length: 8 }, (_, index) => reviewCase(`case-${index}`));
    let concurrent = 0;
    let maximum = 0;
    const repository = {
      listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: cases, hasNextPage: true }),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
      getCase: vi.fn<CaseRepository['getCase']>().mockImplementation(async ({ caseId }) => {
        concurrent += 1;
        maximum = Math.max(maximum, concurrent);
        await Promise.resolve();
        concurrent -= 1;
        return cases.find((item) => item.id === caseId)!;
      }),
    };
    const result = await readScreeningReviewPage(repository, 'analyst', 3, 'previous');
    expect(result.items).toHaveLength(8);
    expect(result.nextCursor).toBe('case-3');
    expect(maximum).toBe(4);
    expect(repository.getCase).toHaveBeenCalledTimes(4);
  });

  it.each([
    { status: 'closed' as const },
    { status: 'snoozed' as const },
    { assignedTo: 'colleague' },
    { snoozedUntil: '2099-01-01T00:00:00Z' },
  ])('excludes a case whose current detail is no longer eligible: %j', async (overrides) => {
    const summary = reviewCase('case');
    const result = await readScreeningReviewPage(
      {
        listCases: async () => ({ items: [summary], hasNextPage: false }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
        getCase: async () => ({ ...summary, ...overrides }),
      },
      'analyst',
      50,
      null,
    );
    expect(result.items).toEqual([]);
  });

  it('keeps successful results without skipping failed cases and recovers by retrying the same page', async () => {
    const first = reviewCase('first');
    const second = reviewCase('second');
    let fail = true;
    const repository = {
      listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: [first, second], hasNextPage: false }),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
      getCase: vi.fn<CaseRepository['getCase']>().mockImplementation(async ({ caseId }) => {
        if (fail && caseId === second.id) throw new Error('temporary');
        return caseId === first.id ? first : second;
      }),
    };
    expect(await readScreeningReviewPage(repository, 'analyst', 50, null)).toMatchObject({
      items: expect.any(Array),
      failed: true,
      nextCursor: null,
    });
    expect((await readScreeningReviewPage(repository, 'analyst', 50, null)).items).toHaveLength(2);
    fail = false;
    const recovered = await readScreeningReviewPage(repository, 'analyst', 50, null);
    expect(recovered.items).toHaveLength(4);
    expect(recovered.failed).toBe(false);
  });

  it('distinguishes an empty queue from a failed list request', async () => {
    const repository = {
      listCases: vi
        .fn<CaseRepository['listCases']>()
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce({ items: [] satisfies Case[], hasNextPage: false }),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
      getCase: vi.fn<CaseRepository['getCase']>(),
    };
    expect(await readScreeningReviewPage(repository, 'analyst', 50, null)).toEqual({
      items: [],
      nextCursor: null,
      failed: true,
    });
    expect(await readScreeningReviewPage(repository, 'analyst', 50, null)).toEqual({
      items: [],
      nextCursor: null,
      failed: false,
    });
  });

  describe('filters and search', () => {
    const decided = { ...objectReviewScreening(), status: 'confirmed_hit' as const };

    it('reads closed cases outside To review and keeps their hits', async () => {
      const closed = reviewCase('closed', [decided], { status: 'closed' });
      const repository = {
        listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: [closed], hasNextPage: false }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
        getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValue(closed),
      };
      const result = await readScreeningReviewPage(repository, 'analyst', 50, null, { filter: 'validated' });
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toMatchObject({ caseStatus: 'closed' });
      expect(repository.listCases.mock.calls[0]?.[0].statuses).toEqual([
        'pending',
        'investigating',
        'waiting_for_action',
        'closed',
      ]);
    });

    it('fills the page with hits that match the filter', async () => {
      // Details load four at a time: the first batch is all pending, the second is decided.
      const cases = [
        ...Array.from({ length: 4 }, (_, index) => reviewCase(`pending-${index}`)),
        reviewCase('reviewed', [decided]),
      ];
      const repository = {
        listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: cases, hasNextPage: true }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
        getCase: vi
          .fn<CaseRepository['getCase']>()
          .mockImplementation(async ({ caseId }) => cases.find((item) => item.id === caseId)!),
      };
      const toReview = await readScreeningReviewPage(repository, 'analyst', 1, null);
      expect(toReview).toMatchObject({ nextCursor: 'pending-3' });
      expect(toReview.items).toHaveLength(8);
      const validated = await readScreeningReviewPage(repository, 'analyst', 1, null, { filter: 'validated' });
      expect(validated).toMatchObject({ nextCursor: 'reviewed' });
      expect(validated.items).toHaveLength(10);
    });

    it('retries a failed closure and keeps the case as validated outside To review', async () => {
      const ended = reviewCase('ended', [{ ...objectReviewScreening(), status: 'no_hit' }]);
      const repository = {
        listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: [ended], hasNextPage: false }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
        getCase: vi.fn<CaseRepository['getCase']>().mockResolvedValue(ended),
      };
      const result = await readScreeningReviewPage(repository, 'analyst', 50, null, { filter: 'all' });
      expect(repository.updateCase).toHaveBeenCalledOnce();
      expect(result.items.map((item) => item.caseStatus)).toEqual(['closed', 'closed']);
    });

    it('passes a search to the case name filter and omits an empty one', async () => {
      const repository = {
        listCases: vi.fn<CaseRepository['listCases']>().mockResolvedValue({ items: [], hasNextPage: false }),
        updateCase: vi.fn<CaseRepository['updateCase']>(),
        getCase: vi.fn<CaseRepository['getCase']>(),
      };
      await readScreeningReviewPage(repository, 'analyst', 50, null, { name: 'Amira' });
      await readScreeningReviewPage(repository, 'analyst', 50, null, { name: '' });
      expect(repository.listCases.mock.calls[0]?.[0]).toMatchObject({ name: 'Amira' });
      expect(repository.listCases.mock.calls[1]?.[0]).not.toHaveProperty('name');
    });
  });
});
