import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import type { CaseStatus } from '@app-builder/models/cases';
import {
  buildScreeningReviewItems,
  matchesScreeningReviewFilter,
  needsFalsePositiveClosure,
  type ScreeningReviewFilter,
  type ScreeningReviewItem,
} from '@app-builder/models/screening-review';
import { getCase, listCases } from '@app-builder/server/cases';
import { closeFalsePositiveCase } from './screening-review-decision';

export interface ScreeningReviewPage {
  items: ScreeningReviewItem[];
  nextCursor: string | null;
  failed: boolean;
  /** Cases this read closed, after a closure that failed on write. To review leaves them out of `items`. */
  closedCaseIds?: string[];
}

/**
 * Caps the cases one request scans, so a queue whose cases are all reviewed cannot chain hundreds of
 * backend calls. A request that reaches it returns what it found with a cursor for the next page.
 */
export const MAX_SCANNED_CASES = 100;

export interface ScreeningReviewPageOptions {
  inboxId?: string;
  filter?: ScreeningReviewFilter;
  /** Matched against case names, which hold the customer's name. */
  name?: string;
}

const OPEN_CASE_STATUSES: CaseStatus[] = ['pending', 'investigating', 'waiting_for_action'];

/**
 * Whole case batches may overflow the hit target, avoiding offsets inside mutable screenings.
 * The target counts the hits that match the filter. Every hit of a read case is returned, so the
 * page can count the other filters from what it loaded.
 */
export async function readScreeningReviewPage(
  api: MarbleCoreApi,
  userId: string,
  limit: number,
  cursor: string | null,
  { inboxId = MY_INBOX_ID, filter = 'to_review', name }: ScreeningReviewPageOptions = {},
): Promise<ScreeningReviewPage> {
  const items: ScreeningReviewItem[] = [];
  const closedCaseIds: string[] = [];
  // Closed cases pile up over time, so To review never reads them.
  const includeClosed = filter !== 'to_review';
  let offsetId = cursor;
  let matchingCount = 0;
  let scannedCount = 0;
  while (true) {
    let page;
    try {
      page = await listCases(api, {
        assigneeId: userId,
        ...(inboxId !== MY_INBOX_ID ? { inboxIds: [inboxId] } : {}),
        statuses: includeClosed ? [...OPEN_CASE_STATUSES, 'closed'] : OPEN_CASE_STATUSES,
        ...(name ? { name } : {}),
        snoozed: false,
        limit,
        // Oldest first, so cases created since the last read come at the end.
        order: 'ASC',
        ...(offsetId ? { offsetId } : {}),
        type: ['continuous_screening'],
      });
    } catch {
      return { items, nextCursor: null, failed: true, closedCaseIds };
    }
    if (page.items.length === 0) return { items, nextCursor: null, failed: false, closedCaseIds };
    if (page.items.at(-1)?.id === offsetId) throw new Error('Case pagination did not advance');

    // Fetch at most four case details concurrently, preserving the API's cursor order.
    for (let index = 0; index < page.items.length; index += 4) {
      const batch = page.items.slice(index, index + 4);
      const results = await Promise.allSettled(
        batch.map(async (summary) => {
          // Backends that predate the `type[]` filter ignore it and still return other case types.
          if (summary.type !== 'continuous_screening') return [];
          const detail = await getCase(api, { caseId: summary.id });
          if (
            detail.assignedTo !== userId ||
            (inboxId !== MY_INBOX_ID && detail.inboxId !== inboxId) ||
            (detail.status === 'closed' && !includeClosed) ||
            detail.status === 'snoozed' ||
            (detail.snoozedUntil && Date.parse(detail.snoozedUntil) > Date.now())
          )
            return [];
          // A closure that failed after the last review is retried here; its hits are done either way.
          if (needsFalsePositiveClosure(detail)) {
            const closed = await closeFalsePositiveCase(api, detail);
            if (closed) closedCaseIds.push(detail.id);
            return includeClosed ? buildScreeningReviewItems([closed ? { ...detail, status: 'closed' } : detail]) : [];
          }
          return buildScreeningReviewItems([detail]);
        }),
      );
      for (const result of results) {
        // Retry the same page on failure. Never advance a cursor beyond missing data.
        if (result.status === 'rejected') return { items, nextCursor: null, failed: true, closedCaseIds };
        items.push(...result.value);
        matchingCount += result.value.filter((item) => matchesScreeningReviewFilter(item, filter)).length;
      }
      const last = batch.at(-1);
      if (!last || last.id === offsetId) throw new Error('Case pagination did not advance');
      offsetId = last.id;
      scannedCount += batch.length;
      if (matchingCount >= limit || scannedCount >= MAX_SCANNED_CASES) {
        const more = index + batch.length < page.items.length || page.hasNextPage;
        return { items, nextCursor: more ? offsetId : null, failed: false, closedCaseIds };
      }
    }
    if (!page.hasNextPage) return { items, nextCursor: null, failed: false, closedCaseIds };
  }
}
