import { toOrderedTopic, topicCategoryPriority } from '@app-builder/components/Screenings/TopicsDisplay';
import { FTM_ENTITIES_PROPERTIES } from '@app-builder/constants/ftm-entities';
import type { CaseDetail } from './cases';
import type { ContinuousScreening, OpenSanctionEntityPayload } from './continuous-screening';
import {
  getCategoryForTopic,
  isLexisTopic,
  lexisTopicIgnoreDisplay,
  type ScreeningCategory,
  type ScreeningMatchComment,
  type ScreeningMatchExplanation,
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
    name: caption || customerNames(properties).join(' · ') || `${objectType} · ${objectId}`,
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
        comments: match.comments,
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
  const families = new Set(topics.map(topicFamily));
  return TOPIC_FAMILY_ORDER.filter((family) => families.has(family));
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
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
function normalizeCountry(value: string) {
  const text = value.trim();
  return normalizeText(/^[A-Za-z]{2}$/.test(text) ? (countryNames.of(text.toUpperCase()) ?? text) : text);
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
  const fullName = propertyValues(properties, ['firstName', 'lastName']).join(' ');
  return fullName ? [fullName] : [];
}

function compareRow(item: ScreeningReviewItem, row: ComparedRow): ScreeningReviewFieldComparison | undefined {
  const listProperties = item.listRecord.properties as Record<string, unknown>;
  const customerValues =
    row.kind === 'name'
      ? customerNames(item.customer.properties)
      : propertyValues(item.customer.properties, row.properties);
  const listRecordValues = propertyValues(listProperties, row.properties);
  const aliases = row.kind === 'name' ? propertyValues(listProperties, NAME_ALIAS_PROPERTIES) : [];
  if (!customerValues.length && !listRecordValues.length && !aliases.length) return undefined;

  // The best pair decides. Main names come before aliases, so they win ties.
  let best: { state: Exclude<ScreeningReviewFieldState, 'missing'>; customer: string; listRecord: string } | undefined;
  for (const customer of customerValues) {
    for (const listRecord of [...listRecordValues, ...aliases]) {
      const state = compareValues(row.kind, customer, listRecord);
      if (state && (!best || STATE_RANK[state] > STATE_RANK[best.state])) best = { state, customer, listRecord };
    }
  }
  const viaAlias = best && !listRecordValues.includes(best.listRecord) ? best.listRecord : undefined;
  return {
    field: row.field,
    kind: row.kind,
    state: best?.state ?? 'missing',
    source: 'browser',
    customerValues: withFirst(customerValues, best?.customer),
    listRecordValues: viaAlias ? listRecordValues : withFirst(listRecordValues, best?.listRecord),
    ...(viaAlias ? { viaAlias } : {}),
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
  const explanation = explanations?.[signal];
  const value = explanation ? (explanation.score ?? 0) : (features?.[signal] ?? 0);
  return value > 0;
}

export type ScreeningReviewChipField = 'birthDate' | 'nationality' | 'identifier';

/** Fields that light up on the hit card: strong agreement only, and never the name. */
export function screeningReviewChipFields(
  comparisons: readonly ScreeningReviewFieldComparison[],
): ScreeningReviewChipField[] {
  const fields = new Set(
    comparisons.flatMap((row): ScreeningReviewChipField[] => {
      if (row.state !== 'same') return [];
      if (row.field === 'birthDate' || row.field === 'nationality') return [row.field];
      return row.kind === 'identifier' ? ['identifier'] : [];
    }),
  );
  return (['birthDate', 'nationality', 'identifier'] as const).filter((field) => fields.has(field));
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
