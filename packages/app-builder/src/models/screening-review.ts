import { toOrderedTopic, topicCategoryPriority } from '@app-builder/components/Screenings/TopicsDisplay';
import type { CaseDetail } from './cases';
import type { ContinuousScreening, OpenSanctionEntityPayload } from './continuous-screening';
import {
  getCategoryForTopic,
  isLexisTopic,
  lexisTopicIgnoreDisplay,
  type ScreeningCategory,
  type ScreeningMatchComment,
  type ScreeningMatchStatus,
} from './screening';

export interface ScreeningReviewItem {
  id: string;
  caseId: string;
  caseName: string;
  caseCreatedAt: string;
  inboxId: string;
  screeningId: string;
  matchId: string;
  triggerType: ContinuousScreening['triggerType'];
  customer: {
    key: string;
    objectType: string;
    objectId: string;
    name: string;
    schema?: string;
    properties: Record<string, string[]>;
  };
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
  schema?: string,
  caption?: string,
) {
  return {
    key: JSON.stringify([objectType, objectId]),
    objectType,
    objectId,
    schema,
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
            match.payload.schema,
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
      const queries = Object.values(screening.request.searchInput.queries);
      const customer = customerReference(screening.objectType, screening.objectId, properties, queries[0]?.schema);
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

const TOPIC_FAMILY_ORDER: ScreeningCategory[] = [
  'sanctions',
  'peps',
  'adverse-media',
  'third-parties',
  'custom',
  'global',
];

function topicFamily(topic: string): ScreeningCategory | undefined {
  if (!isLexisTopic(topic)) return getCategoryForTopic(topic);
  if (lexisTopicIgnoreDisplay(topic)) return undefined;
  if (topic.startsWith('sanctions')) return 'sanctions';
  if (topic.startsWith('pep')) return 'peps';
  if (topic.startsWith('adverse_media')) return 'adverse-media';
  return undefined;
}

/** One entry per topic family, for the hit card's topic dots. */
export function screeningReviewTopicFamilies(topics: readonly string[]): ScreeningCategory[] {
  const families = new Set(topics.map(topicFamily));
  return TOPIC_FAMILY_ORDER.filter((family) => families.has(family));
}

export type ScreeningReviewMatchedField = 'birthDate' | 'nationality';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

// Timestamps and dates compare by day. Partial dates, like a year alone, don't count as equal.
function normalizeDate(value: string) {
  const match = /^(\d{4}-\d{2}-\d{2})(?:T.*)?$/.exec(value.trim());
  const day = match?.[1];
  if (!day) return '';
  const date = new Date(`${day}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === day ? day : '';
}

// List records use ISO country codes, while customer data can hold a code or an English name.
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
function normalizeCountry(value: string) {
  const text = value.trim();
  return normalizeText(/^[A-Za-z]{2}$/.test(text) ? (countryNames.of(text.toUpperCase()) ?? text) : text);
}

const COMPARED_FIELDS: {
  field: ScreeningReviewMatchedField;
  properties: string[];
  normalize: (value: string) => string;
}[] = [
  { field: 'birthDate', properties: ['birthDate'], normalize: normalizeDate },
  { field: 'nationality', properties: ['nationality', 'citizenship'], normalize: normalizeCountry },
];

/**
 * The single comparison entry point: fields where customer and list record values are equal
 * after normalization. It makes no phonetic or fuzzy claim. MAR-2444 extends it with field states.
 */
export function matchedScreeningReviewFields(item: ScreeningReviewItem): ScreeningReviewMatchedField[] {
  return COMPARED_FIELDS.filter(({ properties, normalize }) => {
    const values = (source: Record<string, string[]>) =>
      properties.flatMap((property) => source[property] ?? []).map(normalize);
    const listRecordValues = new Set(values(item.listRecord.properties));
    return values(item.customer.properties).some((value) => value !== '' && listRecordValues.has(value));
  }).map(({ field }) => field);
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
