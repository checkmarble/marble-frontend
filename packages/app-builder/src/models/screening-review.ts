import {
  getFilteredAndSortedTopics,
  toOrderedTopic,
  topicCategoryPriority,
} from '@app-builder/components/Screenings/TopicsDisplay';
import { FTM_ENTITIES_PROPERTIES } from '@app-builder/constants/ftm-entities';
import * as countryCatalog from 'country-flag-emojis/flags';
import type { CaseDetail, CaseStatus } from './cases';
import type { ContinuousScreening, OpenSanctionEntityPayload } from './continuous-screening';
import {
  getCategoryForTopic,
  isLexisTopic,
  lexisTopicIgnoreDisplay,
  type ScreeningCategory,
  type ScreeningMatchComment,
  type ScreeningMatchExplanation,
  type ScreeningMatchStatus,
  type ScreeningMatchTentativeReview,
} from './screening';

export interface ScreeningReviewItem {
  id: string;
  caseId: string;
  caseName: string;
  caseCreatedAt: string;
  caseStatus: CaseStatus;
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
  /** The user who decided the hit, as last loaded. */
  reviewedBy?: string;
  screeningStatus: ContinuousScreening['status'];
  comments: ScreeningMatchComment[];
  tentativeReview: ScreeningMatchTentativeReview | null;
  partial: boolean;
  /** Motiva signals stored on the match, comparing this customer with this list record. */
  signals: ScreeningReviewSignals;
}

export interface ScreeningReviewSignals {
  features?: Record<string, number>;
  explanations?: Record<string, ScreeningMatchExplanation>;
}

function matchSignals({ features, explanations }: ScreeningReviewSignals): ScreeningReviewSignals {
  return { ...(features ? { features } : {}), ...(explanations ? { explanations } : {}) };
}

/** One customer's hits in one case. A customer with several cases has one group per case. */
export interface ScreeningReviewGroup {
  key: string;
  caseId: string;
  customer: ScreeningReviewItem['customer'];
  items: ScreeningReviewItem[];
  remaining: number;
  total: number;
  incomplete: boolean;
  caseCreatedAt: string;
  setAside: number;
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
    name: caption || customerNames(properties).join(' · ') || `${objectType} · ${objectId}`,
    properties,
  };
}

/** The backend keeps a tentative review after the final decision, which supersedes it. */
function activeTentativeReview(match: {
  status: ScreeningMatchStatus;
  tentativeReview: ScreeningMatchTentativeReview | null;
}) {
  return match.status === 'pending' ? match.tentativeReview : null;
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
        caseStatus: caseDetail.status,
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
          reviewedBy: match.reviewedBy,
          comments: match.comments,
          tentativeReview: activeTentativeReview(match),
          signals: matchSignals(match.payload),
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
        reviewedBy: match.reviewedBy,
        comments: match.comments,
        tentativeReview: activeTentativeReview(match),
        signals: matchSignals(match.payload),
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
  return orderScreeningCategories(topics.map(topicFamily).filter((family) => family !== undefined));
}

/** Topics and lists in each category. A hit carries topics, lists, or both, and a category chip's badge is their sum. */
export function screeningReviewCategoryCounts(
  topics: readonly string[],
  listCategories: Iterable<ScreeningCategory>,
): Map<ScreeningCategory, number> {
  const counts = new Map<ScreeningCategory, number>();
  const add = (category: ScreeningCategory) => counts.set(category, (counts.get(category) ?? 0) + 1);
  // Same topics the Tags row renders, so the badge matches the tags it collapses.
  for (const topic of getFilteredAndSortedTopics(topics)) {
    const family = topicFamily(topic);
    if (family) add(family);
  }
  for (const category of listCategories) add(category);
  return counts;
}

/** Sanctions, PEPs, adverse media, then the other categories, each once. */
export function orderScreeningCategories(categories: Iterable<ScreeningCategory>): ScreeningCategory[] {
  const present = new Set(categories);
  return TOPIC_FAMILY_ORDER.filter((category) => present.has(category));
}

export type ScreeningReviewFieldState = 'same' | 'close' | 'different' | 'missing';
export type ScreeningReviewFieldKind = 'name' | 'date' | 'country' | 'identifier' | 'text';

export interface ScreeningReviewFieldComparison {
  /** FTM property, except `nationality` which also reads `citizenship`. */
  field: string;
  kind: ScreeningReviewFieldKind;
  state: ScreeningReviewFieldState;
  source: 'browser' | 'motiva';
  /** The Motiva feature that decided the state, when `source` is `motiva`. */
  signal?: string;
  /** Distinct values, the one that decided the state first. */
  customerValues: string[];
  /** Distinct values, the one that decided the state first. Names list only the main names. */
  listRecordValues: string[];
  /** The list record alias that matched the customer name, when no main name did as well. */
  viaAlias?: string;
  /**
   * The list record value, from another country property, that matched the customer country, when
   * no value of the row's own properties did as well. Motiva compares every country property at once.
   */
  viaProperty?: { property: string; value: string };
}

const STATE_RANK: Record<ScreeningReviewFieldState, number> = { missing: 0, different: 1, close: 2, same: 3 };

const NAME_ALIAS_PROPERTIES = ['alias', 'weakAlias', 'previousName'];
const COUNTRY_PROPERTIES = new Set([
  'nationality',
  'citizenship',
  'country',
  'birthCountry',
  'jurisdiction',
  'mainCountry',
  'flag',
]);
const IDENTIFIER_PROPERTIES = new Set([
  'idNumber',
  'passportNumber',
  'socialSecurityNumber',
  'registrationNumber',
  'taxNumber',
  'vatCode',
  'leiCode',
  'innCode',
  'ogrnCode',
  'swiftBic',
  'isinCode',
  'imoNumber',
  'mmsi',
  'callSign',
]);
// Table order. Fields outside this list follow, in configuration order.
const FIELD_ORDER = [
  'name',
  'birthDate',
  'nationality',
  'birthCountry',
  'country',
  'gender',
  'idNumber',
  'passportNumber',
  'socialSecurityNumber',
  'registrationNumber',
  'jurisdiction',
  'mainCountry',
  'imoNumber',
  'mmsi',
  'callSign',
  'flag',
  'isinCode',
];
// Covered by the name row.
const SKIPPED_PROPERTIES = new Set(['name', 'firstName', 'lastName']);

function fieldKind(property: string): ScreeningReviewFieldKind {
  if (property === 'name') return 'name';
  if (property.endsWith('Date')) return 'date';
  if (COUNTRY_PROPERTIES.has(property)) return 'country';
  if (IDENTIFIER_PROPERTIES.has(property)) return 'identifier';
  return 'text';
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function nameTokens(value: string) {
  return new Set(
    normalizeText(value)
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean),
  );
}

// Timestamps compare by day. A year or year-month alone is a partial date.
function parseDate(value: string) {
  const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?:T.*)?$/.exec(value.trim());
  if (!match) return null;
  const [, year = '', month, day] = match;
  if (month && (Number(month) < 1 || Number(month) > 12)) return null;
  if (month && day) {
    const iso = `${year}-${month}-${day}`;
    const date = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null;
    return { year, full: iso };
  }
  return { year, full: undefined };
}

// List records use ISO country codes, while customer data can hold a code or an English name.
const COUNTRY_ALIASES: Record<string, string[]> = {
  CZ: ['Czech Republic'],
  GB: ['Great Britain', 'UK'],
  KR: ['Republic of Korea'],
  TR: ['Türkiye'],
  US: ['United States of America', 'USA'],
};
function countryKey(value: string) {
  return normalizeText(value)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
let countryIndex: Map<string, string> | undefined;
function getCountryIndex() {
  if (countryIndex) return countryIndex;
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  countryIndex = new Map();
  for (const { isoAlpha2, isoAlpha3, nameEnglish } of Object.values(countryCatalog)) {
    if (!/^[A-Z]{2}$/.test(isoAlpha2)) continue;
    const names = [isoAlpha2, isoAlpha3, nameEnglish, regionNames.of(isoAlpha2), ...(COUNTRY_ALIASES[isoAlpha2] ?? [])];
    for (const name of names) if (name) countryIndex.set(countryKey(name), isoAlpha2);
  }
  return countryIndex;
}
/** The ISO alpha-2 code of a country code or English name, or `undefined` when it is not recognised. */
function normalizeCountry(value: string) {
  return getCountryIndex().get(countryKey(value));
}

function normalizeIdentifier(value: string) {
  return value.replace(/[^\p{L}\p{N}]/gu, '').toUpperCase();
}

/** Compares two values of the same kind, or returns `undefined` when either one is unusable. */
function compareValues(
  kind: ScreeningReviewFieldKind,
  customer: string,
  listRecord: string,
): Exclude<ScreeningReviewFieldState, 'missing'> | undefined {
  switch (kind) {
    case 'name': {
      const a = nameTokens(customer);
      const b = nameTokens(listRecord);
      if (!a.size || !b.size) return undefined;
      const shared = [...a].filter((token) => b.has(token));
      if (shared.length === a.size && shared.length === b.size) return 'same';
      if (shared.length === a.size || shared.length === b.size) return 'close';
      return shared.some((token) => token.length >= 3) ? 'close' : 'different';
    }
    case 'date': {
      const a = parseDate(customer);
      const b = parseDate(listRecord);
      if (!a || !b) return undefined;
      if (a.full && a.full === b.full) return 'same';
      return a.year === b.year ? 'close' : 'different';
    }
    case 'country': {
      const a = normalizeCountry(customer);
      const b = normalizeCountry(listRecord);
      if (!a || !b) return undefined;
      return a === b ? 'same' : 'different';
    }
    case 'identifier': {
      const a = normalizeIdentifier(customer);
      const b = normalizeIdentifier(listRecord);
      if (!a || !b) return undefined;
      return a === b ? 'same' : 'different';
    }
    case 'text': {
      const a = normalizeText(customer);
      const b = normalizeText(listRecord);
      if (!a || !b) return undefined;
      return a === b ? 'same' : 'different';
    }
  }
}

function propertyValues(source: Record<string, unknown>, properties: readonly string[]) {
  const values = properties.flatMap((property) => {
    const value = source[property];
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
  });
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function withFirst(values: string[], first: string | undefined) {
  return first === undefined ? values : [first, ...values.filter((value) => value !== first)];
}

interface ComparedRow {
  field: string;
  kind: ScreeningReviewFieldKind;
  properties: string[];
}

function comparedRows(item: ScreeningReviewItem, mappedProperties: readonly string[] | undefined): ComparedRow[] {
  const schema = [item.customer.schema, item.listRecord.schema].find(
    (candidate): candidate is keyof typeof FTM_ENTITIES_PROPERTIES =>
      !!candidate && candidate in FTM_ENTITIES_PROPERTIES,
  );
  const properties =
    mappedProperties ?? (schema ? FTM_ENTITIES_PROPERTIES[schema] : Object.values(FTM_ENTITIES_PROPERTIES).flat());
  const rows = new Map<string, ComparedRow>([['name', { field: 'name', kind: 'name', properties: ['name'] }]]);
  for (const property of properties) {
    if (SKIPPED_PROPERTIES.has(property)) continue;
    const field = property === 'citizenship' ? 'nationality' : property;
    if (rows.has(field)) continue;
    rows.set(field, {
      field,
      kind: fieldKind(field),
      properties: field === 'nationality' ? ['nationality', 'citizenship'] : [field],
    });
  }
  const order = (field: string) => {
    const index = FIELD_ORDER.indexOf(field);
    return index === -1 ? FIELD_ORDER.length : index;
  };
  return [...rows.values()].sort((a, b) => order(a.field) - order(b.field));
}

function customerNames(properties: Record<string, string[]>) {
  const names = propertyValues(properties, ['name']);
  if (names.length) return names;
  // Each component is deduplicated on its own, so `Ali Ali` keeps both parts.
  const fullName = ['firstName', 'lastName'].flatMap((property) => propertyValues(properties, [property])).join(' ');
  return fullName ? [fullName] : [];
}

/** Values the row also compares against, behind its own: name aliases, or the other country properties. */
function fallbackValues(listProperties: Record<string, unknown>, row: ComparedRow) {
  if (row.kind === 'name') {
    return propertyValues(listProperties, NAME_ALIAS_PROPERTIES).map((value) => ({ value, property: 'alias' }));
  }
  if (row.kind === 'country') {
    return [...COUNTRY_PROPERTIES]
      .filter((property) => !row.properties.includes(property))
      .flatMap((property) => propertyValues(listProperties, [property]).map((value) => ({ value, property })));
  }
  return [];
}

function compareRow(item: ScreeningReviewItem, row: ComparedRow): ScreeningReviewFieldComparison | undefined {
  const listProperties = item.listRecord.properties as Record<string, unknown>;
  const customerValues =
    row.kind === 'name'
      ? customerNames(item.customer.properties)
      : propertyValues(item.customer.properties, row.properties);
  const listRecordValues = propertyValues(listProperties, row.properties);
  const fallbacks = fallbackValues(listProperties, row);
  if (!customerValues.length && !listRecordValues.length && !fallbacks.length) return undefined;

  // The best pair decides. On a tie, the row's own value beats a fallback, whichever customer value it pairs with.
  const candidates = [...listRecordValues.map((value) => ({ value, property: undefined })), ...fallbacks];
  type Best = {
    state: Exclude<ScreeningReviewFieldState, 'missing'>;
    customer: string;
    listRecord: string;
    property: string | undefined;
  };
  let best: Best | undefined;
  for (const customer of customerValues) {
    for (const { value: listRecord, property } of candidates) {
      const state = compareValues(row.kind, customer, listRecord);
      if (!state) continue;
      const beatsBest =
        !best ||
        STATE_RANK[state] > STATE_RANK[best.state] ||
        (STATE_RANK[state] === STATE_RANK[best.state] && !property && !!best.property);
      if (beatsBest) best = { state, customer, listRecord, property };
    }
  }
  const viaFallback = best?.property ? best : undefined;
  return {
    field: row.field,
    kind: row.kind,
    state: best?.state ?? 'missing',
    source: 'browser',
    customerValues: withFirst(customerValues, best?.customer),
    listRecordValues: viaFallback ? listRecordValues : withFirst(listRecordValues, best?.listRecord),
    ...(viaFallback && row.kind === 'name' ? { viaAlias: viaFallback.listRecord } : {}),
    ...(viaFallback?.property && row.kind === 'country'
      ? { viaProperty: { property: viaFallback.property, value: viaFallback.listRecord } }
      : {}),
  };
}

/**
 * The single comparison entry point, for the comparison table and the hit card chips.
 * Rows follow the customer table's FTM mapping (`mappedProperties`), or the entity type's
 * screenable properties when the mapping is unknown. Rows empty on both sides are left out.
 * The browser comparison makes no phonetic claim.
 */
export function compareScreeningReviewFields(
  item: ScreeningReviewItem,
  mappedProperties?: readonly string[],
): ScreeningReviewFieldComparison[] {
  const rows = comparedRows(item, mappedProperties).flatMap((row) => compareRow(item, row) ?? []);
  // Motiva's identifier features don't say which identifier matched.
  const comparedIdentifiers = rows.filter((row) => row.kind === 'identifier' && row.state !== 'missing').length;
  return rows.map((row) => {
    if (row.state === 'missing') return row;
    const override = motivaRules(row, comparedIdentifiers === 1).find(({ signal }) =>
      motivaFired(item.signals, signal),
    );
    if (!override) return row;
    return { ...row, state: override.state, source: 'motiva', signal: override.signal };
  });
}

// Motiva logic-v1 features are keyed by scoring feature, not by field. The first rule that fired wins.
const MOTIVA_FUZZY_NAME_FEATURES = [
  'person_name_phonetic_match',
  'person_name_jaro_winkler',
  'name_fingerprint_levenshtein',
  'weak_alias_match',
];
const MOTIVA_IDENTIFIER_FEATURES = [
  'identifier_match',
  'lei_code_match',
  'isin_security_match',
  'ogrn_code_match',
  'inn_code_match',
  'bic_code_match',
  'vessel_imo_mmsi_match',
];
const ORGANIZATION_ID_PROPERTIES = new Set([
  'registrationNumber',
  'taxNumber',
  'vatCode',
  'leiCode',
  'innCode',
  'ogrnCode',
]);

type MotivaRule = { signal: string; state: Exclude<ScreeningReviewFieldState, 'missing'> };

function motivaRules(row: ScreeningReviewFieldComparison, singleIdentifier: boolean): MotivaRule[] {
  if (row.kind === 'name') {
    return [
      { signal: 'name_literal_match', state: 'same' },
      { signal: 'last_name_mismatch', state: 'different' },
      ...MOTIVA_FUZZY_NAME_FEATURES.map((signal) => ({ signal, state: 'close' as const })),
    ];
  }
  if (row.field === 'birthDate') {
    const sameYear = row.state === 'same' || row.state === 'close';
    return [
      { signal: 'dob_year_disjoint', state: 'different' },
      { signal: 'dob_day_disjoint', state: sameYear ? 'close' : 'different' },
    ];
  }
  if (row.kind === 'country') return [{ signal: 'country_mismatch', state: 'different' }];
  if (row.field === 'gender') return [{ signal: 'gender_mismatch', state: 'different' }];
  if (row.kind === 'identifier') {
    return [
      ...(singleIdentifier ? MOTIVA_IDENTIFIER_FEATURES.map((signal) => ({ signal, state: 'same' as const })) : []),
      ...(ORGANIZATION_ID_PROPERTIES.has(row.field) ? [{ signal: 'orgid_disjoint', state: 'different' as const }] : []),
    ];
  }
  return [];
}

function motivaFired({ features, explanations }: ScreeningReviewSignals, signal: string) {
  // An explanation's score wins, a zero included; one without a score falls back to the feature.
  const value = explanations?.[signal]?.score ?? features?.[signal] ?? 0;
  return value > 0;
}

export type ScreeningReviewChipField = 'birthDate' | 'nationality' | 'country' | 'identifier';

/** Fields that light up on the hit card: strong agreement only, and never the name. */
export function screeningReviewChipFields(
  comparisons: readonly ScreeningReviewFieldComparison[],
): ScreeningReviewChipField[] {
  const fields = new Set(
    comparisons.flatMap((row): ScreeningReviewChipField[] => {
      if (row.state !== 'same') return [];
      if (row.field === 'birthDate' || row.field === 'nationality') return [row.field];
      if (row.kind === 'country') return ['country'];
      return row.kind === 'identifier' ? ['identifier'] : [];
    }),
  );
  return (['birthDate', 'nationality', 'country', 'identifier'] as const).filter((field) => fields.has(field));
}

/** A hit the backend still takes a decision on. A case closed by other means takes no more decisions. */
function isOpenHit(item: ScreeningReviewItem) {
  return item.status === 'pending' && item.screeningStatus === 'in_review' && item.caseStatus !== 'closed';
}

/** A tentative review from the inbox the case was escalated from leaves the hit to review here. */
export function awaitsEscalation(item: ScreeningReviewItem) {
  return isOpenHit(item) && item.tentativeReview?.inboxId === item.inboxId;
}

export function isPendingReviewItem(item: ScreeningReviewItem) {
  return isOpenHit(item) && !awaitsEscalation(item);
}

/** The queue filters. To review reads open cases only; the others also read closed cases. */
export const SCREENING_REVIEW_FILTERS = ['all', 'to_review', 'validated'] as const;

/** The longest comment a decision can carry. */
export const SCREENING_REVIEW_COMMENT_MAX = 5000;

/** The longest name search the queue accepts. */
export const SCREENING_REVIEW_SEARCH_MAX = 200;
export type ScreeningReviewFilter = (typeof SCREENING_REVIEW_FILTERS)[number];

/** Validated holds every hit that no longer waits for a decision, so decided hits show read-only. */
export function matchesScreeningReviewFilter(item: ScreeningReviewItem, filter: ScreeningReviewFilter) {
  if (filter === 'all') return true;
  return isPendingReviewItem(item) === (filter === 'to_review');
}

/** How many of `items` each filter holds. */
export function countScreeningReviewFilters(
  items: readonly ScreeningReviewItem[],
): Record<ScreeningReviewFilter, number> {
  const toReview = items.filter(isPendingReviewItem).length;
  return { all: items.length, to_review: toReview, validated: items.length - toReview };
}

function topicPriority(item: ScreeningReviewItem) {
  return Math.min(
    999,
    ...item.topics.map((topic) => topicCategoryPriority[toOrderedTopic(topic).split('.')[0] ?? ''] ?? 999),
  );
}

export function screeningReviewGroupKey(item: ScreeningReviewItem) {
  return JSON.stringify([item.caseId, item.customer.key]);
}

/** A hit of a partial screening still in review on an open case, whose next matches wait for Load more. */
export function awaitsMoreMatches(item: ScreeningReviewItem) {
  return item.partial && item.screeningStatus === 'in_review' && item.caseStatus !== 'closed';
}

/** Behind a Hit, No hit and skipped hits are only counted, unless their screening has matches to load. */
function isSetAside(item: ScreeningReviewItem) {
  return (item.status === 'no_hit' || item.status === 'skipped') && !awaitsMoreMatches(item);
}

/**
 * Groups items by case, then by customer. `isListed` picks the items that put a group in the list,
 * and a listed group also shows its decided hits, so a partly reviewed case loads with its No hit
 * stack. Every item counts toward the group's total, and only pending ones toward `remaining`. Once a
 * hit is a Hit, the group keeps it and its pending hits, and counts the No hit and skipped ones in
 * `setAside`.
 */
export function groupScreeningReviewItems(
  items: readonly ScreeningReviewItem[],
  hasMore = false,
  isListed: (item: ScreeningReviewItem) => boolean = isPendingReviewItem,
) {
  const groups = new Map<string, ScreeningReviewGroup & { all: ScreeningReviewItem[] }>();
  for (const item of items) {
    const key = screeningReviewGroupKey(item);
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        caseId: item.caseId,
        customer: item.customer,
        items: [],
        all: [],
        remaining: 0,
        total: 0,
        incomplete: hasMore,
        caseCreatedAt: item.caseCreatedAt,
        setAside: 0,
      };
      groups.set(key, group);
    }
    group.total += 1;
    group.all.push(item);
    group.incomplete ||= item.partial;
    if (isPendingReviewItem(item)) group.remaining += 1;
    if (isListed(item)) group.items.push(item);
  }
  return [...groups.values()]
    .filter((group) => group.items.length > 0)
    .sort((a, b) => a.caseCreatedAt.localeCompare(b.caseCreatedAt) || a.key.localeCompare(b.key))
    .map(({ all, ...group }): ScreeningReviewGroup => {
      const shown = [
        ...group.items,
        ...all.filter((item) => (item.status !== 'pending' || awaitsEscalation(item)) && !group.items.includes(item)),
      ];
      const confirmed = shown.some((item) => item.status === 'confirmed_hit');
      const listed = confirmed ? shown.filter((item) => !isSetAside(item)) : shown;
      return {
        ...group,
        // No hit hits last, then by topic, score and identity.
        items: listed.sort(
          (a, b) =>
            Number(a.status === 'no_hit') - Number(b.status === 'no_hit') ||
            topicPriority(a) - topicPriority(b) ||
            b.score - a.score ||
            a.id.localeCompare(b.id),
        ),
        setAside: confirmed ? all.filter(isSetAside).length : 0,
      };
    });
}

/**
 * A group with nothing left to do here: no pending hit, no Hit, and no decision waiting for its
 * write. To review drops it. A partial screening keeps it, for its matches still to load.
 */
export function isSettledScreeningReviewGroup(group: ScreeningReviewGroup, session: ScreeningReviewSession) {
  return group.items.every(
    (item) =>
      item.status !== 'pending' &&
      item.status !== 'confirmed_hit' &&
      !(item.partial && item.screeningStatus === 'in_review') &&
      session.decided[item.id]?.written !== false,
  );
}

/** A card of the hit list: one hit, or a group's No hit hits stacked behind one another. */
export type ScreeningReviewCard =
  | { kind: 'hit'; key: string; item: ScreeningReviewItem }
  | { kind: 'no_hit_stack'; key: string; items: ScreeningReviewItem[] };

/**
 * A group's cards, its No hit hits last. Two No hit hits or more stack as one card, unless the group
 * is in `expanded`.
 */
export function screeningReviewCards(
  group: ScreeningReviewGroup,
  expanded: ReadonlySet<string> = new Set(),
): ScreeningReviewCard[] {
  const noHit = group.items.filter((item) => item.status === 'no_hit');
  const stacked = noHit.length > 1 && !expanded.has(group.key);
  return group.items.flatMap((item): ScreeningReviewCard[] => {
    if (!stacked || item.status !== 'no_hit') return [{ kind: 'hit', key: item.id, item }];
    return item === noHit[0] ? [{ kind: 'no_hit_stack', key: `${group.key}:no_hit`, items: noHit }] : [];
  });
}

/** The hit a card opens on. */
export function screeningReviewCardLead(card: ScreeningReviewCard) {
  return card.kind === 'hit' ? card.item : card.items[0]!;
}

/**
 * The next or previous card's hit, or the next or previous group's first card. A No hit stack is
 * one stop, unless its group is in `expanded`.
 */
export function adjacentScreeningReviewItem(
  groups: readonly ScreeningReviewGroup[],
  activeId: string | undefined,
  direction: -1 | 1,
  byGroup = false,
  expanded: ReadonlySet<string> = new Set(),
) {
  const holds = (card: ScreeningReviewCard) =>
    card.kind === 'hit' ? card.item.id === activeId : card.items.some((item) => item.id === activeId);
  if (byGroup) {
    const index = groups.findIndex((group) => group.items.some((item) => item.id === activeId));
    const group = groups[index + direction];
    const first = group ? screeningReviewCards(group, expanded)[0] : undefined;
    return first ? screeningReviewCardLead(first) : undefined;
  }
  const cards = groups.flatMap((group) => screeningReviewCards(group, expanded));
  const card = cards[cards.findIndex(holds) + direction];
  return card ? screeningReviewCardLead(card) : undefined;
}

/** How long a customer's hits stay listed after their case closes. */
export const SCREENING_REVIEW_HIDE_DELAY_MS = 5_000;

/** How long a decision can be undone before it's written. */
export const SCREENING_REVIEW_UNDO_DELAY_MS = 5_000;

export type ScreeningReviewDecision = 'confirmed_hit' | 'no_hit';

/** A decision written during this visit. */
export interface ScreeningReviewDecided {
  /** The item when it was decided, so it stays listed after its case leaves the server data. */
  item: ScreeningReviewItem;
  decision: ScreeningReviewDecision;
  comment?: string;
  /** Set for a tentative review: `decision` is then not final, and the hit stays pending. */
  tentativeReview?: ScreeningMatchTentativeReview;
  /** False during the undo delay and while the write runs: the screen shows its predicted effect. */
  written: boolean;
}

export type ScreeningReviewEscalation =
  | 'escalated'
  | 'no_escalation_inbox'
  | 'inactive_escalation_inbox'
  | 'case_closed'
  | 'failed';

/** What a write did to its screening and case. */
export interface ScreeningReviewScreeningResult {
  status: ContinuousScreening['status'];
  caseClosed: boolean;
}

/** Local state laid over server data, so decided hits don't flicker back on refetch. */
export interface ScreeningReviewSession {
  decided: Readonly<Record<string, ScreeningReviewDecided>>;
  screenings: Readonly<Record<string, ScreeningReviewScreeningResult>>;
  hiddenCases: readonly string[];
  /** The hits of each case escalated this visit, as they were: the server stops returning the case at once. */
  escalated: Readonly<Record<string, readonly ScreeningReviewItem[]>>;
}

export const emptyScreeningReviewSession: ScreeningReviewSession = {
  decided: {},
  screenings: {},
  hiddenCases: [],
  escalated: {},
};

function isObjectTriggeredItem(item: ScreeningReviewItem) {
  return item.triggerType !== 'dataset_updated';
}

/**
 * The pending hits a Hit on `item` skips. The backend skips them on a customer-triggered screening;
 * list-update hits stay independent until the screening's last pending hit.
 */
export function screeningReviewHitsSkippedBy(items: readonly ScreeningReviewItem[], item: ScreeningReviewItem) {
  if (!isObjectTriggeredItem(item)) return [];
  // Tentatively reviewed hits are still pending for the backend, so they are skipped too.
  return items.filter((other) => other.screeningId === item.screeningId && other.id !== item.id && isOpenHit(other));
}

/**
 * A terminal status saved this visit outlasts older data that still says `in_review`. A saved
 * `in_review`, kept when the write's readback failed, yields to fresher data.
 */
function reconciledScreeningStatus(
  saved: ScreeningReviewScreeningResult | undefined,
  fresh: ContinuousScreening['status'],
): ContinuousScreening['status'] {
  return saved && saved.status !== 'in_review' ? saved.status : fresh;
}

function isAwaitingWrite(session: ScreeningReviewSession, screeningId: string) {
  return Object.values(session.decided).some(({ item, written }) => !written && item.screeningId === screeningId);
}

/**
 * What the backend will do to a screening once its unwritten decisions are written: a Hit ends a
 * customer-triggered screening, and the last pending hit ends any complete screening.
 */
function predictedScreeningStatus(hits: readonly ScreeningReviewItem[]): ContinuousScreening['status'] | undefined {
  const [first] = hits;
  if (!first) return undefined;
  const confirmed = hits.some((hit) => hit.status === 'confirmed_hit');
  if (confirmed && isObjectTriggeredItem(first)) return 'confirmed_hit';
  if (first.partial || hits.some((hit) => hit.status === 'pending')) return undefined;
  return confirmed ? 'confirmed_hit' : 'no_hit';
}

/** Server items with this visit's decisions applied, minus the cases already hidden. */
export function applyScreeningReviewSession(
  items: readonly ScreeningReviewItem[],
  session: ScreeningReviewSession,
): ScreeningReviewItem[] {
  const applied = applyScreeningReviewDecisions(items, session);
  const predicted = new Map<string, ContinuousScreening['status']>();
  for (const { item, written } of Object.values(session.decided)) {
    if (written || predicted.has(item.screeningId)) continue;
    const status = predictedScreeningStatus(applied.filter((other) => other.screeningId === item.screeningId));
    if (status) predicted.set(item.screeningId, status);
  }
  if (!predicted.size) return applied;
  return applied.map((item) => {
    const status = predicted.get(item.screeningId);
    return status ? { ...item, screeningStatus: status } : item;
  });
}

function applyScreeningReviewDecisions(
  items: readonly ScreeningReviewItem[],
  session: ScreeningReviewSession,
): ScreeningReviewItem[] {
  const hidden = new Set(session.hiddenCases);
  const merged = new Map(items.map((item) => [item.id, item]));
  for (const { item } of Object.values(session.decided)) if (!merged.has(item.id)) merged.set(item.id, item);
  for (const item of Object.values(session.escalated).flat()) if (!merged.has(item.id)) merged.set(item.id, item);
  const confirmedScreenings = new Set(
    Object.values(session.decided)
      .filter(
        ({ item, decision, tentativeReview }) =>
          decision === 'confirmed_hit' && !tentativeReview && isObjectTriggeredItem(item),
      )
      .map(({ item }) => item.screeningId),
  );
  return [...merged.values()]
    .filter((item) => !hidden.has(item.caseId))
    .map((item) => {
      const decided = session.decided[item.id];
      const skipped = item.status === 'pending' && confirmedScreenings.has(item.screeningId);
      const screeningStatus = reconciledScreeningStatus(session.screenings[item.screeningId], item.screeningStatus);
      if (decided?.tentativeReview) {
        if (skipped) return { ...item, status: 'skipped', tentativeReview: null, screeningStatus };
        if (decided.written && item.status !== 'pending') return { ...item, screeningStatus };
        return { ...item, tentativeReview: decided.tentativeReview, screeningStatus };
      }
      return {
        ...item,
        status: decided?.decision ?? (skipped ? 'skipped' : item.status),
        screeningStatus,
      };
    });
}

/**
 * Pending hits, every hit of a screening decided during this visit, written or not, every hit of a
 * partial screening still in review, whose next matches wait for Load more, and every hit of a case
 * escalated during this visit, until it is hidden.
 */
export function isListedInScreeningReviewSession(item: ScreeningReviewItem, session: ScreeningReviewSession) {
  return (
    isPendingReviewItem(item) ||
    awaitsMoreMatches(item) ||
    !!session.escalated[item.caseId] ||
    !!session.decided[item.id] ||
    !!session.screenings[item.screeningId] ||
    Object.values(session.decided).some((decided) => decided.item.screeningId === item.screeningId)
  );
}

export type ScreeningReviewScreeningState =
  | 'in_review'
  /** Partial, with no pending hit left: more matches exist and the case must not close. */
  | 'load_more'
  | 'confirmed_hit'
  | 'case_closed'
  /** `no_hit` with the case still open: the next load closes it. */
  | 'closure_pending'
  | 'escalated'
  /** The case calls for escalation, but its escalation failed: the next load retries it. */
  | 'escalation_pending';

export function screeningReviewScreeningState(
  items: readonly ScreeningReviewItem[],
  item: ScreeningReviewItem,
  session: ScreeningReviewSession,
): ScreeningReviewScreeningState {
  if (session.escalated[item.caseId]) return 'escalated';
  const caseAwaitingWrite = Object.values(session.decided).some(
    ({ item: decided, written }) => !written && decided.caseId === item.caseId,
  );
  // Until its decisions are written, the case only predicts its escalation, which the undo toast tells.
  if (!caseAwaitingWrite && willEscalateScreeningReviewCase(items, item.caseId)) return 'escalation_pending';
  const result = session.screenings[item.screeningId];
  // An unwritten decision is newer than the last write's result, so its prediction wins.
  const predicted = isAwaitingWrite(session, item.screeningId);
  const status = predicted
    ? (items.find((other) => other.id === item.id) ?? item).screeningStatus
    : reconciledScreeningStatus(result, item.screeningStatus);
  if (status === 'confirmed_hit') return 'confirmed_hit';
  if (status === 'no_hit') {
    // The case closes once every one of its screenings ends at no_hit.
    const caseClosed = predicted
      ? items.every((other) => other.caseId !== item.caseId || other.screeningStatus === 'no_hit')
      : // A refresh that finds the case closed supersedes an earlier failed closure.
        !!result?.caseClosed || item.caseStatus === 'closed';
    return caseClosed ? 'case_closed' : 'closure_pending';
  }
  // A case closed by other means takes no more decisions, so it isn't offered more matches either.
  if (item.caseStatus === 'closed') return 'in_review';
  const pending = items.some((other) => other.screeningId === item.screeningId && isPendingReviewItem(other));
  return item.partial && !pending ? 'load_more' : 'in_review';
}

/** Every other screening of the item's case ended at `no_hit`: ending this one at `no_hit` closes the case. */
export function isLastOpenScreeningOfCase(items: readonly ScreeningReviewItem[], item: ScreeningReviewItem) {
  return items.every(
    (other) =>
      other.caseId !== item.caseId || other.screeningId === item.screeningId || other.screeningStatus === 'no_hit',
  );
}

/** The pending hits of the active hit's group, which A selects. */
export function screeningReviewGroupPendingItems(groups: readonly ScreeningReviewGroup[], activeId: string) {
  const group = groups.find((candidate) => candidate.items.some((item) => item.id === activeId));
  return group?.items.filter(isPendingReviewItem) ?? [];
}

/** After a decision: the customer's next pending hit, then the next customer's, wrapping around. */
export function nextPendingScreeningReviewItem(groups: readonly ScreeningReviewGroup[], fromId: string) {
  const start = Math.max(
    0,
    groups.findIndex((group) => group.items.some((item) => item.id === fromId)),
  );
  const ordered = [...groups.slice(start), ...groups.slice(0, start)];
  for (const [position, group] of ordered.entries()) {
    const pending = group.items.filter((item) => item.id !== fromId && isPendingReviewItem(item));
    // In the customer's own group, prefer the hits below the decided one.
    const from = position === 0 ? group.items.findIndex((item) => item.id === fromId) : -1;
    const next = pending.find((item) => group.items.indexOf(item) > from) ?? pending[0];
    if (next) return next;
  }
  return undefined;
}

/** Predicts, from the listed hits, the escalation `screeningReviewCaseFollowUp` makes after a write. */
export function willEscalateScreeningReviewCase(items: readonly ScreeningReviewItem[], caseId: string) {
  const caseItems = items.filter((item) => item.caseId === caseId);
  return (
    caseItems.some(awaitsEscalation) && !caseItems.some((item) => isPendingReviewItem(item) || awaitsMoreMatches(item))
  );
}

/** Unlike the escalation after a write, Escalate leaves the matches still to load pending. */
export function canEscalateScreeningReviewCase(items: readonly ScreeningReviewItem[], caseId: string) {
  const caseItems = items.filter((item) => item.caseId === caseId);
  return caseItems.some(awaitsEscalation) && !caseItems.some(isPendingReviewItem);
}

/** Every screening ended at `no_hit` but the case is still open, after a failed closure. */
export function needsFalsePositiveClosure(caseDetail: CaseDetail) {
  return (
    caseDetail.type === 'continuous_screening' &&
    caseDetail.status !== 'closed' &&
    caseDetail.continuousScreenings.length > 0 &&
    caseDetail.continuousScreenings.every((screening) => screening.status === 'no_hit')
  );
}

export type ScreeningReviewCaseFollowUp = 'close' | 'escalate' | 'none';

/** Escalating unassigns the case, so only a write by its assignee escalates it. */
export function screeningReviewCaseFollowUp(caseDetail: CaseDetail, userId: string): ScreeningReviewCaseFollowUp {
  if (needsFalsePositiveClosure(caseDetail)) return 'close';
  if (caseDetail.type !== 'continuous_screening' || caseDetail.status === 'closed' || caseDetail.assignedTo !== userId)
    return 'none';
  const inReview = caseDetail.continuousScreenings.filter((screening) => screening.status === 'in_review');
  if (inReview.some((screening) => screening.partial)) return 'none';
  const pending = inReview.flatMap((screening) => screening.matches.filter((match) => match.status === 'pending'));
  const awaiting = pending.filter((match) => match.tentativeReview?.inboxId === caseDetail.inboxId);
  return awaiting.length > 0 && awaiting.length === pending.length ? 'escalate' : 'none';
}
