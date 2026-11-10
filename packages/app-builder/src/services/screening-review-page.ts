import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import {
  buildScreeningReviewItems,
  isPendingReviewItem,
  needsFalsePositiveClosure,
  type ScreeningReviewItem,
} from '@app-builder/models/screening-review';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import { closeFalsePositiveCase } from './screening-review-decision';

export interface ScreeningReviewPage {
  items: ScreeningReviewItem[];
  nextCursor: string | null;
  failed: boolean;
}

/** Whole case batches may overflow the hit target, avoiding offsets inside mutable screenings. */
export async function readScreeningReviewPage(
  repository: Pick<CaseRepository, 'listCases' | 'getCase' | 'updateCase'>,
  userId: string,
  limit: number,
  cursor: string | null,
  inboxId = MY_INBOX_ID,
): Promise<ScreeningReviewPage> {
  const items: ScreeningReviewItem[] = [];
  let offsetId = cursor;
  let pendingCount = 0;
  while (true) {
    let page;
    try {
      page = await repository.listCases({
        assigneeId: userId,
        ...(inboxId !== MY_INBOX_ID ? { inboxIds: [inboxId] } : {}),
        statuses: ['pending', 'investigating', 'waiting_for_action'],
        snoozed: false,
        limit,
        order: 'DESC',
        ...(offsetId ? { offsetId } : {}),
        type: ['continuous_screening'],
      });
    } catch {
      return { items, nextCursor: null, failed: true };
    }
    if (page.items.length === 0) return { items, nextCursor: null, failed: false };
    if (page.items.at(-1)?.id === offsetId) throw new Error('Case pagination did not advance');

    // Fetch at most four case details concurrently, preserving the API's cursor order.
    for (let index = 0; index < page.items.length; index += 4) {
      const batch = page.items.slice(index, index + 4);
      const results = await Promise.allSettled(
        batch.map(async (summary) => {
          // Backends that predate the `type[]` filter ignore it and still return other case types.
          if (summary.type !== 'continuous_screening') return [];
          const detail = await repository.getCase({ caseId: summary.id });
          if (
            detail.assignedTo !== userId ||
            (inboxId !== MY_INBOX_ID && detail.inboxId !== inboxId) ||
            detail.status === 'closed' ||
            detail.status === 'snoozed' ||
            (detail.snoozedUntil && Date.parse(detail.snoozedUntil) > Date.now())
          )
            return [];
          // A closure that failed after the last review is retried here; its hits are done either way.
          if (needsFalsePositiveClosure(detail)) {
            await closeFalsePositiveCase(repository, detail);
            return [];
          }
          return buildScreeningReviewItems([detail]);
        }),
      );
      for (const result of results) {
        // Retry the same page on failure. Never advance a cursor beyond missing data.
        if (result.status === 'rejected') return { items, nextCursor: null, failed: true };
        items.push(...result.value);
        pendingCount += result.value.filter(isPendingReviewItem).length;
      }
      const last = batch.at(-1);
      if (!last || last.id === offsetId) throw new Error('Case pagination did not advance');
      offsetId = last.id;
      if (pendingCount >= limit) {
        const more = index + batch.length < page.items.length || page.hasNextPage;
        return { items, nextCursor: more ? offsetId : null, failed: false };
      }
    }
    if (!page.hasNextPage) return { items, nextCursor: null, failed: false };
  }
}
