import { toOrderedTopic, topicCategoryPriority } from '@app-builder/components/Screenings/TopicsDisplay';
import type { CaseDetail } from './cases';
import type { ContinuousScreening, OpenSanctionEntityPayload } from './continuous-screening';
import type { ScreeningMatchComment, ScreeningMatchStatus } from './screening';

export interface ScreeningReviewItem {
  id: string;
  caseId: string;
  caseName: string;
  caseCreatedAt: string;
  inboxId: string;
  screeningId: string;
  matchId: string;
  triggerType: ContinuousScreening['triggerType'];
  customer: { key: string; objectType: string; objectId: string; name: string; properties: Record<string, string[]> };
  listRecord: OpenSanctionEntityPayload;
  score: number;
  topics: string[];
  status: ScreeningMatchStatus;
  screeningStatus: ContinuousScreening['status'];
  comments: ScreeningMatchComment[];
  partial: boolean;
}

export interface ScreeningReviewGroup {
  key: string;
  customer: ScreeningReviewItem['customer'];
  items: ScreeningReviewItem[];
  remaining: number;
  total: number;
  incomplete: boolean;
  newestCase: string;
}

function customerReference(
  objectType: string,
  objectId: string,
  properties: Record<string, string[]>,
  caption?: string,
) {
  return {
    key: JSON.stringify([objectType, objectId]),
    objectType,
    objectId,
    name: caption || properties['name']?.filter(Boolean).join(' · ') || `${objectType} · ${objectId}`,
    properties,
  };
}

/** The only review-stream code that interprets the two screening directions. */
export function buildScreeningReviewItems(cases: readonly CaseDetail[]): ScreeningReviewItem[] {
  return cases.flatMap((caseDetail) => {
    if (caseDetail.type !== 'continuous_screening') return [];
    return caseDetail.continuousScreenings.flatMap((screening) => {
      const base = {
        caseId: caseDetail.id,
        caseName: caseDetail.name,
        caseCreatedAt: caseDetail.createdAt,
        inboxId: caseDetail.inboxId,
        screeningId: screening.id,
        triggerType: screening.triggerType,
        screeningStatus: screening.status,
        partial: screening.partial,
      };
      if (screening.triggerType === 'dataset_updated') {
        return screening.matches.map((match) => ({
          ...base,
          id: `${caseDetail.id}:${screening.id}:${match.id}`,
          matchId: match.id,
          customer: customerReference(
            match.objectType,
            match.objectId,
            match.payload.properties,
            match.payload.caption,
          ),
          listRecord: screening.opensanctionEntityPayload,
          score: match.payload.score,
          topics: screening.opensanctionEntityPayload.properties['topics'] ?? [],
          status: match.status,
          comments: match.comments,
        }));
      }
      // All query entries belong to this one customer; don't silently drop later entries.
      const properties: Record<string, string[]> = {};
      for (const query of Object.values(screening.request.searchInput.queries)) {
        for (const [key, values] of Object.entries(query.properties)) {
          properties[key] = [...new Set([...(properties[key] ?? []), ...values])];
        }
      }
      const customer = customerReference(screening.objectType, screening.objectId, properties);
      return screening.matches.map((match) => ({
        ...base,
        id: `${caseDetail.id}:${screening.id}:${match.id}`,
        matchId: match.id,
        customer,
        listRecord: { ...match.payload, id: match.opensanctionEntityId },
        score: match.payload.score,
        topics: match.payload.properties['topics'] ?? [],
        status: match.status,
        comments: match.comments,
      }));
    });
  });
}

export function isPendingReviewItem(item: ScreeningReviewItem) {
  return item.status === 'pending' && item.screeningStatus === 'in_review';
}

function topicPriority(item: ScreeningReviewItem) {
  return Math.min(
    999,
    ...item.topics.map((topic) => topicCategoryPriority[toOrderedTopic(topic).split('.')[0] ?? ''] ?? 999),
  );
}

export function groupScreeningReviewItems(items: readonly ScreeningReviewItem[], hasMore = false) {
  const groups = new Map<string, ScreeningReviewGroup>();
  for (const item of items) {
    let group = groups.get(item.customer.key);
    if (!group) {
      group = {
        key: item.customer.key,
        customer: item.customer,
        items: [],
        remaining: 0,
        total: 0,
        incomplete: hasMore,
        newestCase: item.caseCreatedAt,
      };
      groups.set(group.key, group);
    }
    group.total += 1;
    group.incomplete ||= item.partial;
    if (item.caseCreatedAt > group.newestCase) {
      group.newestCase = item.caseCreatedAt;
      group.customer = item.customer;
    }
    if (isPendingReviewItem(item)) {
      group.items.push(item);
      group.remaining += 1;
    }
  }
  return [...groups.values()]
    .filter((group) => group.remaining > 0)
    .sort((a, b) => b.newestCase.localeCompare(a.newestCase) || a.key.localeCompare(b.key))
    .map((group) => ({
      ...group,
      items: group.items.sort(
        (a, b) => topicPriority(a) - topicPriority(b) || b.score - a.score || a.id.localeCompare(b.id),
      ),
    }));
}

export function adjacentScreeningReviewItem(
  groups: readonly ScreeningReviewGroup[],
  activeId: string | undefined,
  direction: -1 | 1,
  byCustomer = false,
) {
  if (byCustomer) {
    const index = groups.findIndex((group) => group.items.some((item) => item.id === activeId));
    return groups[index + direction]?.items[0];
  }
  const items = groups.flatMap((group) => group.items);
  const index = items.findIndex((item) => item.id === activeId);
  return items[index + direction];
}
