import {
  type listScreeningAvailableFilters,
  ScreeningAvailableFilters,
  type ScreeningDto,
  type ScreeningEntityDto,
  type ScreeningErrorDto,
  type ScreeningFileDto,
  type ScreeningMatchDto,
  type ScreeningMatchPayloadDto,
  type ScreeningRequestDto,
} from 'marble-api';
import * as R from 'remeda';
import { match, P } from 'ts-pattern';
import { TagProps } from 'ui-design-system';

export const matchEntitySchemas = [
  'Thing',
  'LegalEntity',
  'Person',
  'Organization',
  'Company',
  'Vehicle',
  'Airplane',
  'Vessel',
  'Family',
  'Associate',
  'MembershipMember',
] as const;
const sanctionEntitySchemas = ['Sanction'] as const;
export const openSanctionEntitySchemas = [...matchEntitySchemas, ...sanctionEntitySchemas] as const;

export type ScreeningStatus = 'in_review' | 'confirmed_hit' | 'no_hit' | 'error';
export type ScreeningMatchStatus = 'pending' | 'confirmed_hit' | 'no_hit' | 'skipped';
export type OpenSanctionEntitySchema = (typeof openSanctionEntitySchemas)[number];

export type AvailableFeatures = Parameters<typeof listScreeningAvailableFilters>[0];
export const availableFeatures = [
  'transaction_monitoring',
  'continuous_monitoring',
  'manual_search',
] as const satisfies Array<AvailableFeatures>;

export type OpenSanctionEntity = {
  id: string;
  schema: OpenSanctionEntitySchema;
  properties: Record<string, string[]>;
};

export type ScreeningSanctionEntity = {
  id: string;
  schema: 'Sanction';
  properties: Record<string, string[]>;
};

export type ScreeningMatchEntitySchema = Extract<
  OpenSanctionEntitySchema,
  | 'Thing'
  | 'LegalEntity'
  | 'Person'
  | 'Organization'
  | 'Company'
  | 'Vehicle'
  | 'Airplane'
  | 'Vessel'
  | 'Family'
  | 'Associate'
  | 'MembershipMember'
>;

export type PersonEntity = OpenSanctionEntity & {
  schema: 'Person';
  target: boolean;
  properties: {
    caption: string;
    name?: string[];
    alias?: string[];
    notes?: string[];
    gender?: string[];
    topics?: string[];
    lastName?: string[];
    position?: string[];
    religion?: string[];
    birthDate?: string[];
    education?: string[];
    firstName?: string[];
    sourceUrl?: string[];
    weakAlias?: string[];
    birthPlace?: string[];
    wikidataId?: string[];
    citizenship?: string[];
  } & Record<string, string[]>;
};

export type FamilyPersonEntity = OpenSanctionEntity & {
  schema: 'Family';
  properties: {
    person?: string[];
    endDate?: string[];
    relative?: PersonEntity[];
    sourceUrl?: string[];
    startDate?: string[];
    relationship?: string[];
  } & Record<string, string[]>;
};

export type FamilyRelativeEntity = OpenSanctionEntity & {
  schema: 'Family';
  properties: {
    person?: PersonEntity[];
    endData?: string[];
    relative?: string[];
    sourceUrl?: string[];
    startDate?: string[];
    relationship?: string[];
  } & Record<string, string[]>;
};

export type AssociationEntity = OpenSanctionEntity & {
  schema: 'Associate';
  target: boolean;
  caption: string;
  datasets: string[];
  last_seen: string;
  referents: string[];
  first_seen: string;
  last_change: string;
  properties: {
    person?: PersonEntity[];
    associate?: string[];
    sourceUrl?: string[];
    relationship?: string[];
    topics?: string[];
  } & Record<string, string[]>;
};

export type MembershipMemberEntity = OpenSanctionEntity & {
  schema: 'MembershipMember';
  target: boolean;
  caption: string;
  datasets: string[];
  last_seen: string;
  referents: string[];
  first_seen: string;
  last_change: string;
  properties: {
    person?: PersonEntity[];
    organization?: PersonEntity[];
    member?: string[];
    sourceUrl?: string[];
    relationship?: string[];
    topics?: string[];
    role?: string[];
    startDate?: string[];
    endDate?: string[];
  } & Record<string, string[]>;
};

export type ScreeningMatchPayload = {
  id: string;
  match: boolean;
  score: number;
  schema: ScreeningMatchEntitySchema;
  datasets?: string[];
  caption: string;
  properties: {
    sanctions?: ScreeningSanctionEntity[];
    familyPerson?: FamilyPersonEntity[];
    familyRelative?: FamilyRelativeEntity[];
    associations?: AssociationEntity[];
    membershipMember?: MembershipMemberEntity[];
  } & Record<string, string[]>;
};

export function isKnownEntitySchema<K extends OpenSanctionEntitySchema>(
  schema: string,
  schemaList: readonly K[],
): schema is K {
  return (schemaList as ReadonlyArray<string>).includes(schema);
}

export function adaptScreeningMatchPayload(dto: ScreeningMatchPayloadDto): ScreeningMatchPayload {
  return {
    ...dto,
    schema: isKnownEntitySchema(dto.schema, matchEntitySchemas) ? dto.schema : 'Thing',
  };
}

export type ScreeningMatch = {
  id: string;
  entityId: string;
  queryIds: string[];
  status: ScreeningMatchStatus;
  enriched: boolean;
  // datasets: unknown[];
  payload: ScreeningMatchPayload;
  comments: {
    id: string;
    authorId: string;
    comment: string;
    createdAt: string;
  }[];
};

export function adaptScreeningMatch(dto: ScreeningMatchDto): ScreeningMatch {
  return {
    id: dto.id,
    entityId: dto.entity_id,
    queryIds: dto.query_ids,
    status: dto.status,
    enriched: dto.enriched,
    payload: adaptScreeningMatchPayload(dto.payload),
    comments: R.map(dto.comments, (comment) => ({
      id: comment.id,
      authorId: comment.author_id,
      comment: comment.comment,
      createdAt: comment.created_at,
    })),
  };
}

export type ScreeningQuery = {
  schema: OpenSanctionEntitySchema;
  properties: {
    [key: string]: string[];
  };
};

export type ScreeningRequest = {
  threshold: number;
  limit: number;
  queries: {
    [key: string]: ScreeningQuery;
  };
};

function adaptQueries(dto: ScreeningRequestDto['search_input']['queries']) {
  return R.mapValues(dto, (value) => {
    return {
      schema: isKnownEntitySchema(value.schema, matchEntitySchemas) ? value.schema : 'Thing',
      properties: value.properties,
    };
  });
}

export function adaptScreeningRequest(dto: ScreeningRequestDto): ScreeningRequest {
  return {
    threshold: dto.threshold,
    limit: dto.limit,
    queries: adaptQueries(dto.search_input.queries),
  };
}

type BaseScreening = {
  id: string;
  config: {
    name: string;
  };
  uniqueCounterpartyIdentifier?: string;
  decisionId: string;
  partial: boolean;
  isManual: boolean;
  matches: ScreeningMatch[];
  initialQuery: {
    schema: ScreeningEntityDto;
    properties: Record<string, string[]>;
  }[];
};
export type ScreeningError = BaseScreening & {
  status: 'error';
  request: ScreeningRequest | null;
  errorCodes: ScreeningErrorDto['error_codes'];
};
export type ScreeningNoHit = BaseScreening & {
  status: 'no_hit';
  request: ScreeningRequest | null;
};
export type ScreeningSuccess = BaseScreening & {
  status: Exclude<ScreeningStatus, 'error | no_hit'>;
  request: ScreeningRequest;
};

export type Screening = ScreeningError | ScreeningSuccess | ScreeningNoHit;

export function adaptScreening(dto: ScreeningDto): Screening {
  const baseScreening: BaseScreening = {
    id: dto.id,
    decisionId: dto.decision_id,
    uniqueCounterpartyIdentifier: dto.unique_counterparty_identifier,
    partial: dto.partial,
    isManual: dto.is_manual,
    matches: R.map(dto.matches, adaptScreeningMatch),
    config: dto.config,
    initialQuery: dto.initial_query ?? [],
  };

  if (dto.status === 'error') {
    return {
      ...baseScreening,
      status: dto.status,
      request: dto.request ? adaptScreeningRequest(dto.request) : null,
      errorCodes: dto.error_codes,
    };
  }

  if (dto.status === 'no_hit') {
    return {
      ...baseScreening,
      status: dto.status,
      request: dto.request ? adaptScreeningRequest(dto.request) : null,
    };
  }

  return {
    ...baseScreening,
    status: dto.status,
    request: adaptScreeningRequest(dto.request),
  };
}

export function adaptScreeningFile(dto: ScreeningFileDto): ScreeningFile {
  return {
    id: dto.id,
    fileName: dto.filename,
    createdAt: dto.created_at,
  };
}

export type ScreeningFile = {
  id: string;
  fileName: string;
  createdAt: string;
};

export function isScreeningError(screening: Screening): screening is ScreeningError {
  return screening.status === 'error';
}

export function isScreeningReviewCompleted(screening: Screening): screening is ScreeningSuccess {
  return screening.status === 'no_hit' || screening.status === 'confirmed_hit';
}

export type ScreeningCategory = 'sanctions' | 'peps' | 'third-parties' | 'adverse-media';

export const SCREENING_CATEGORY_COLORS = {
  sanctions: 'red',
  peps: 'blue',
  'third-parties': 'grey',
  'adverse-media': 'yellow',
  other: 'grey',
} satisfies Record<ScreeningCategory | 'other', TagProps['color']>;

const LEXIS_TOPIC_KEYS = [
  'alive',
  'deceased',
  'sanctions',
  'adverse_media',
  'adverse_media.kind.media',
  'adverse_media.kind.enforcement',
  'adverse_media.category.administrative',
  'adverse_media.category.aircraft_hijacking',
  'adverse_media.category.antitrust_violations',
  'adverse_media.category.arms_trafficking',
  'adverse_media.category.asset_freeze',
  'adverse_media.category.bank_fraud',
  'adverse_media.category.bribery',
  'adverse_media.category.burglary',
  'adverse_media.category.conspiracy',
  'adverse_media.category.corruption',
  'adverse_media.category.counterfeiting',
  'adverse_media.category.crimes_against_humanity',
  'adverse_media.category.cybercrime',
  'adverse_media.category.debarred',
  'adverse_media.category.disciplined',
  'adverse_media.category.disqualified',
  'adverse_media.category.drug_trafficking',
  'adverse_media.category.embezzlement',
  'adverse_media.category.end_use_control',
  'adverse_media.category.environmental_crimes',
  'adverse_media.category.espionage',
  'adverse_media.category.excluded_party',
  'adverse_media.category.explosives',
  'adverse_media.category.extortion_racketeering',
  'adverse_media.category.financial_crimes',
  'adverse_media.category.forgery',
  'adverse_media.category.fraud',
  'adverse_media.category.fugitive',
  'adverse_media.category.gambling_operations',
  'adverse_media.category.healthcare_fraud',
  'adverse_media.category.human_rights_abuse',
  'adverse_media.category.human_trafficking',
  'adverse_media.category.isis_foreign_support',
  'adverse_media.category.insider_trading',
  'adverse_media.category.insurance_fraud',
  'adverse_media.category.interstate_commerce',
  'adverse_media.category.kidnapping',
  'adverse_media.category.labor_violations',
  'adverse_media.category.money_laundering',
  'adverse_media.category.mortgage_fraud',
  'adverse_media.category.most_wanted',
  'adverse_media.category.murder',
  'adverse_media.category.organized_crime',
  'adverse_media.category.peonage',
  'adverse_media.category.pharma_trafficking',
  'adverse_media.category.piracy',
  'adverse_media.category.pollution',
  'adverse_media.category.pornography',
  'adverse_media.category.price_manipulation',
  'adverse_media.category.rico',
  'adverse_media.category.securities_fraud',
  'adverse_media.category.smuggling',
  'adverse_media.category.stolen_property',
  'adverse_media.category.tax_evasion',
  'adverse_media.category.terrorism',
  'adverse_media.category.unauthorized',
  'adverse_media.category.war_crimes',
  'adverse_media.category.wire_fraud',
  'adverse_media.category.weapons_mass_destruction',
  'pep.kind.primary',
  'pep.kind.secondary',
  'pep.status.active',
  'pep.status.inactive',
  'pep.category.chief_of_state',
  'pep.category.diplomat',
  'pep.category.govt_branch_member',
  'pep.category.intelligence',
  'pep.category.intl_org_leadership',
  'pep.category.judiciary',
  'pep.category.law_enforce_authority',
  'pep.category.legislature',
  'pep.category.military',
  'pep.category.ngo_leadership',
  'pep.category.senior_party_member',
  'pep.category.traditional_leadership',
  'pep.category.union_leadership',
  'pep.category.manager_state_owned_enterprise',
  'pep.category.manager_sovereign_wealth_fund',
  'pep.category.associate',
  'pep.category.attorney',
  'pep.category.family_member',
  'pep.category.pep_controlled_business',
  'pep.category.state_owned_enterprise',
];

export type LexisTopic = (typeof LEXIS_TOPIC_KEYS)[number];

export function isLexisTopic(topic: string): topic is LexisTopic {
  return (LEXIS_TOPIC_KEYS as ReadonlyArray<string>).includes(topic);
}

// Some topics are present for filtering but are not directly useful to display (e.g. "pep active"), or may may duplicate too much information for useful display (e.g. "pep and pep.primary")
// so we ignore some of them for display in the UI
export function lexisTopicIgnoreDisplay(topic: LexisTopic): boolean {
  if (['alive', 'pep.status.active', 'adverse_media'].includes(topic)) {
    return true;
  }
  return false;
}

export const OS_TOPICS_KEYS = [
  'sanction',
  'sanction.linked',
  'sanction.counter',
  'asset.frozen',
  'role.pep',
  'role.pol',
  'role.rca',
  'role.judge',
  'role.civil',
  'role.diplo',
  'role.spy',
  'role.lawyer',
  'role.acct',
  'role.journo',
  'role.act',
  'role.lobby',
  'gov.head',
  'crime',
  'crime.fraud',
  'crime.cyber',
  'crime.fin',
  'crime.env',
  'crime.theft',
  'crime.war',
  'crime.boss',
  'crime.terror',
  'crime.traffick',
  'crime.traffick.drug',
  'crime.traffick.human',
  'forced.labor',
  'wanted',
  'corp.disqual',
  'reg.action',
  'reg.warn',
  'debarment',
  'pol.party',
  'pol.union',
  'mil',
  'export.control',
  'export.risk',
  'poi',
] as const;

type OpenSanctionTopic = (typeof OS_TOPICS_KEYS)[number];

export function isOpenSanctionTopic(topic: string): topic is OpenSanctionTopic {
  return (OS_TOPICS_KEYS as ReadonlyArray<string>).includes(topic);
}

const OS_SCREENING_TOPICS_MAP = new Map<string, ScreeningCategory>([
  // Sanctions
  ['sanction', 'sanctions'],
  ['sanction.linked', 'sanctions'],
  ['sanction.counter', 'sanctions'],
  ['asset.frozen', 'sanctions'],

  // PEPs
  ['role.pep', 'peps'],
  ['role.pol', 'peps'],
  ['role.rca', 'peps'],
  ['role.judge', 'peps'],
  ['role.civil', 'peps'],
  ['role.diplo', 'peps'],
  ['role.spy', 'peps'],
  ['gov.head', 'peps'],

  // Third-parties
  ['fin.advisor', 'third-parties'],
  ['role.lawyer', 'third-parties'],
  ['role.acct', 'third-parties'],
  ['role.journo', 'third-parties'],
  ['role.act', 'third-parties'],
  ['role.lobby', 'third-parties'],

  // Adverse media
  ['crime', 'adverse-media'],
  ['crime.fraud', 'adverse-media'],
  ['crime.cyber', 'adverse-media'],
  ['crime.fin', 'adverse-media'],
  ['crime.env', 'adverse-media'],
  ['crime.theft', 'adverse-media'],
  ['crime.war', 'adverse-media'],
  ['crime.boss', 'adverse-media'],
  ['crime.terror', 'adverse-media'],
  ['crime.traffick', 'adverse-media'],
  ['crime.traffick.drug', 'adverse-media'],
  ['crime.traffick.human', 'adverse-media'],
  ['forced.labor', 'adverse-media'],
  ['wanted', 'adverse-media'],
  ['corp.disqual', 'adverse-media'],
  ['reg.action', 'adverse-media'],
  ['reg.warn', 'adverse-media'],
  ['debarment', 'adverse-media'],
  ['pol.party', 'third-parties'],
  ['pol.union', 'third-parties'],
  ['mil', 'adverse-media'],
  ['export.control', 'adverse-media'],
  ['export.risk', 'adverse-media'],
  ['poi', 'third-parties'],

  // Default to adverse-media for ambiguous/government/corporate
  ['corp.offshore', 'third-parties'],
  ['corp.shell', 'third-parties'],
  ['corp.public', 'third-parties'],
  ['gov', 'third-parties'],
  ['gov.national', 'third-parties'],
  ['gov.state', 'third-parties'],
  ['gov.muni', 'third-parties'],
  ['gov.soe', 'third-parties'],
  ['gov.igo', 'third-parties'],
  ['gov.admin', 'third-parties'],
  ['gov.executive', 'third-parties'],
  ['gov.legislative', 'third-parties'],
  ['gov.judicial', 'third-parties'],
  ['gov.security', 'third-parties'],
  ['gov.financial', 'third-parties'],
  ['fin', 'third-parties'],
  ['fin.bank', 'third-parties'],
  ['fin.fund', 'third-parties'],
  ['role.oligarch', 'third-parties'],
  ['rel', 'third-parties'],

  // New camelCase / dotted-hierarchy schema roots. Descendants (e.g. `pep.primary.legislature`,
  // `adverseMedia.enforcements`) are resolved via prefix walk in `getCategoryForTopic`.
  ['pep', 'peps'],
  ['adverseMedia', 'adverse-media'],
]);

function openSanctionsTopicToCategory(topic: string): ScreeningCategory {
  let category = OS_SCREENING_TOPICS_MAP.get(topic);
  if (!category) {
    console.warn(`No category found for topic: ${topic}`);
    category = 'third-parties';
  }
  return category;
}

export function openSanctionsTopicToColor(topic: string): TagProps['color'] {
  const category = openSanctionsTopicToCategory(topic);
  return SCREENING_CATEGORY_COLORS[category];
}

export function lexisTopicToColor(topic: string): TagProps['color'] {
  return match(topic)
    .with(P.string.startsWith('adverse_media'), () => SCREENING_CATEGORY_COLORS['adverse-media'])
    .with(P.string.startsWith('sanctions'), () => SCREENING_CATEGORY_COLORS['sanctions'])
    .with(P.string.startsWith('pep'), () => SCREENING_CATEGORY_COLORS['peps'])
    .otherwise(() => SCREENING_CATEGORY_COLORS['other']);
}

/**
 * Attribute flags returned alongside topics that describe the entity (state),
 * not its categorization. They have no associated category and must not render
 * as a topic tag. Treated as known/expected, so no warning is emitted.
 */
const SCREENING_NON_TOPIC_FLAGS = new Set<string>(['isAlive']);

/**
 * Resolve a screening topic string to its `ScreeningCategory`. Tries an exact
 * match first, then walks up the dotted hierarchy (`a.b.c` → `a.b` → `a`).
 * Returns `undefined` for known non-topic flags and for fully unrecognized
 * topics — callers should treat both as "no tag to render".
 */
export function getCategoryForTopic(topic: string): ScreeningCategory | undefined {
  if (SCREENING_NON_TOPIC_FLAGS.has(topic)) return undefined;

  const exact = OS_SCREENING_TOPICS_MAP.get(topic);
  if (exact) return exact;

  const parts = topic.split('.');
  for (let i = parts.length - 1; i > 0; i--) {
    const prefix = parts.slice(0, i).join('.');
    const category = OS_SCREENING_TOPICS_MAP.get(prefix);
    if (category) return category;
  }

  return undefined;
}

// export function screeningRiskTag

/**
 * Maps ScreeningCategory to i18n key suffix.
 * ScreeningCategory uses hyphens, i18n keys use underscores.
 */
export const SCREENING_CATEGORY_I18N_KEY_MAP: Record<ScreeningCategory, string> = {
  sanctions: 'sanctions',
  peps: 'peps',
  'third-parties': 'third_parties',
  'adverse-media': 'adverse_media',
};

export const SCREENING_CATEGORIES: ScreeningCategory[] = ['sanctions', 'peps', 'third-parties', 'adverse-media'];

/**
 * Convert topic filters from the API back to categories for UI display.
 * Handles both:
 * - Category values directly: ['sanctions', 'peps']
 * - Individual topics (legacy): ['sanction', 'sanction.linked', 'role.pep']
 */
export function topicsToCategories(topicFilters: string[]): ScreeningCategory[] {
  if (topicFilters.length === 0) return [];

  const categories = new Set<ScreeningCategory>();
  for (const value of topicFilters) {
    // Check if it's already a category
    if (SCREENING_CATEGORIES.includes(value as ScreeningCategory)) {
      categories.add(value as ScreeningCategory);
    } else {
      // Legacy: look up individual topic in the map
      const category = getCategoryForTopic(value);
      if (category) {
        categories.add(category);
      }
    }
  }
  return Array.from(categories);
}

const SCREENING_CATEGORY_RANKING: Record<ScreeningCategory | 'other', number> = {
  sanctions: 1,
  'adverse-media': 2,
  peps: 3,
  'third-parties': 4,
  other: 5,
};

export const getHigherCategory = (topics: string[]): ScreeningCategory | 'other' | undefined => {
  const categories = R.map(topics, (topic) => getCategoryForTopic(topic) ?? 'other');
  return R.firstBy(categories, (category) => SCREENING_CATEGORY_RANKING[category]);
};

export type ScreeningAvailableFiltersAdapted = ScreeningAvailableFilters & {
  conditional_filters?: { key: string; name: string; topics: { name: string; key?: string; title: string }[] }[];
};
