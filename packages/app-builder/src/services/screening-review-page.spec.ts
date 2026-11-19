import type { Case } from '@app-builder/models/cases';
import { isPendingReviewItem } from '@app-builder/models/screening-review';
import {
  datasetReviewScreening,
  objectReviewScreening,
  reviewCase,
} from '@app-builder/models/screening-review.test-helpers';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import { describe, expect, it, vi } from 'vitest';
import { MAX_SCANNED_CASES, readScreeningReviewPage } from './screening-review-page';

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
    const result = await readScreeningReviewPage(repository, 'analyst', 50, null, 'selected-inbox');
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
    const result = await readScreeningReviewPage(repository, 'analyst', 50, null, 'my-inbox');
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
      'selected-inbox',
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

  it('retries a failed closure, leaves the case out, and reports only the cases it closed', async () => {
    const noHit = { ...objectReviewScreening(), status: 'no_hit' as const };
    const closes = reviewCase('closes', [noHit]);
    const staysOpen = reviewCase('stays-open', [noHit]);
    const repository = {
      listCases: vi
        .fn<CaseRepository['listCases']>()
        .mockResolvedValue({ items: [closes, staysOpen], hasNextPage: false }),
      updateCase: vi.fn<CaseRepository['updateCase']>().mockImplementation(async ({ caseId }) => {
        if (caseId === staysOpen.id) throw new Error('closure failed');
        return closes;
      }),
      getCase: vi
        .fn<CaseRepository['getCase']>()
        .mockImplementation(async ({ caseId }) => (caseId === closes.id ? closes : staysOpen)),
    };
    expect(await readScreeningReviewPage(repository, 'analyst', 50, null)).toEqual({
      items: [],
      nextCursor: null,
      failed: false,
      closedCaseIds: [closes.id],
    });
    expect(repository.updateCase).toHaveBeenCalledWith({
      caseId: closes.id,
      body: { status: 'closed', outcome: 'false_positive' },
    });
  });

  it('stops after the scan cap and returns a cursor to continue from', async () => {
    const reviewed = Array.from({ length: 2 * MAX_SCANNED_CASES }, (_, index) =>
      reviewCase(`reviewed-${index}`, [{ ...objectReviewScreening(), status: 'no_hit' }]),
    );
    const repository = {
      listCases: vi.fn<CaseRepository['listCases']>().mockImplementation(async ({ offsetId }) => {
        const start = offsetId ? reviewed.findIndex((item) => item.id === offsetId) + 1 : 0;
        return { items: reviewed.slice(start, start + 25), hasNextPage: true };
      }),
      getCase: vi
        .fn<CaseRepository['getCase']>()
        .mockImplementation(async ({ caseId }) => reviewed.find((item) => item.id === caseId)!),
      updateCase: vi.fn<CaseRepository['updateCase']>(),
    };
    const result = await readScreeningReviewPage(repository, 'analyst', 50, null);
    expect(result.items.filter(isPendingReviewItem)).toEqual([]);
    expect(result).toMatchObject({ nextCursor: `reviewed-${MAX_SCANNED_CASES - 1}`, failed: false });
    expect(repository.getCase).toHaveBeenCalledTimes(MAX_SCANNED_CASES);
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
      closedCaseIds: [],
    });
    expect(await readScreeningReviewPage(repository, 'analyst', 50, null)).toEqual({
      items: [],
      nextCursor: null,
      failed: false,
      closedCaseIds: [],
    });
  });
});
