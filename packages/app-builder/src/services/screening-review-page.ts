import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import type { CaseStatus } from '@app-builder/models/cases';
import {
  buildScreeningReviewItems,
  matchesScreeningReviewFilter,
  type ScreeningReviewEscalation,
  type ScreeningReviewFilter,
  type ScreeningReviewItem,
  screeningReviewCaseFollowUp,
} from '@app-builder/models/screening-review';
import type { CaseRepository } from '@app-builder/repositories/CaseRepository';
import { followUpScreeningReviewCase } from './screening-review-decision';

export interface ScreeningReviewPage {
  items: ScreeningReviewItem[];
  nextCursor: string | null;
  failed: boolean;
  /** Cases this read closed, after a closure that failed on write. To review leaves them out of `items`. */
  closedCaseIds?: string[];
  /**
   * Escalations this read retried, after one that failed on write. An escalated case is left out of
   * `items`; one that failed again stays.
   */
  escalations?: ScreeningReviewRetriedEscalation[];
}

export interface ScreeningReviewRetriedEscalation {
  caseId: string;
  /** The inbox the case was escalated from. */
  inboxId: string;
  escalation: ScreeningReviewEscalation;
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
  repository: Pick<CaseRepository, 'listCases' | 'getCase' | 'updateCase' | 'escalateCase'>,
  userId: string,
  limit: number,
  cursor: string | null,
  { inboxId = MY_INBOX_ID, filter = 'to_review', name }: ScreeningReviewPageOptions = {},
): Promise<ScreeningReviewPage> {
  const items: ScreeningReviewItem[] = [];
  const closedCaseIds: string[] = [];
  const escalations: ScreeningReviewRetriedEscalation[] = [];
  const pageResult = (nextCursor: string | null, failed: boolean): ScreeningReviewPage => ({
    items,
    nextCursor,
    failed,
    closedCaseIds,
    escalations,
  });
  // Closed cases pile up over time, so To review never reads them.
  const includeClosed = filter !== 'to_review';
  let offsetId = cursor;
  let matchingCount = 0;
  let scannedCount = 0;
  while (true) {
    let page;
    try {
      page = await repository.listCases({
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
      return pageResult(null, true);
    }
    if (page.items.length === 0) return pageResult(null, false);
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
            (detail.status === 'closed' && !includeClosed) ||
            detail.status === 'snoozed' ||
            (detail.snoozedUntil && Date.parse(detail.snoozedUntil) > Date.now())
          )
            return [];
          // A closure or an escalation that failed after the last review is retried here.
          const followUp = screeningReviewCaseFollowUp(detail, userId);
          if (followUp === 'none') return buildScreeningReviewItems([detail]);
          const { caseClosed, escalation } = await followUpScreeningReviewCase(repository, detail, userId);
          if (escalation) {
            escalations.push({ caseId: detail.id, inboxId: detail.inboxId, escalation });
            // An escalated case is no longer assigned to the user.
            return escalation === 'escalated' ? [] : buildScreeningReviewItems([detail]);
          }
          // The hits of a case to close are done either way.
          if (caseClosed) closedCaseIds.push(detail.id);
          return includeClosed
            ? buildScreeningReviewItems([caseClosed ? { ...detail, status: 'closed' } : detail])
            : [];
        }),
      );
      for (const result of results) {
        // Retry the same page on failure. Never advance a cursor beyond missing data.
        if (result.status === 'rejected') return pageResult(null, true);
        items.push(...result.value);
        matchingCount += result.value.filter((item) => matchesScreeningReviewFilter(item, filter)).length;
      }
      const last = batch.at(-1);
      if (!last || last.id === offsetId) throw new Error('Case pagination did not advance');
      offsetId = last.id;
      scannedCount += batch.length;
      if (matchingCount >= limit || scannedCount >= MAX_SCANNED_CASES) {
        const more = index + batch.length < page.items.length || page.hasNextPage;
        return pageResult(more ? offsetId : null, false);
      }
    }
    if (!page.hasNextPage) return pageResult(null, false);
  }
}
