import {
  type SanctionCheckDto,
  type SanctionCheckEntityDto,
  type SanctionCheckErrorDto,
  type SanctionCheckFileDto,
  type SanctionCheckMatchDto,
  type SanctionCheckMatchPayloadDto,
  type SanctionCheckRequestDto,
} from 'marble-api';
import * as R from 'remeda';

const matchEntitySchemas = [
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

export type SanctionCheckStatus = 'in_review' | 'confirmed_hit' | 'no_hit' | 'error';
export type SanctionCheckMatchStatus = 'pending' | 'confirmed_hit' | 'no_hit' | 'skipped';
export type OpenSanctionEntitySchema = (typeof openSanctionEntitySchemas)[number];

export type OpenSanctionEntity = {
  id: string;
  schema: OpenSanctionEntitySchema;
  properties: Record<string, string[]>;
};

export type SanctionCheckSanctionEntity = {
  id: string;
  schema: 'Sanction';
  properties: Record<string, string[]>;
};

export type SanctionCheckMatchEntitySchema = Extract<
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

export type SanctionCheckMatchPayload = {
  id: string;
  match: boolean;
  score: number;
  schema: SanctionCheckMatchEntitySchema;
  datasets?: string[];
  caption: string;
  properties: {
    sanctions?: SanctionCheckSanctionEntity[];
    familyPerson?: FamilyPersonEntity[];
    associations?: AssociationEntity[];
    membershipMember?: MembershipMemberEntity[];
  } & Record<string, string[]>;
};

function isKnownEntitySchema<K extends OpenSanctionEntitySchema>(
  schema: string,
  schemaList: readonly K[],
): schema is K {
  return (schemaList as ReadonlyArray<string>).includes(schema);
}

export function adapatSanctionCheckMatchPayload(
  dto: SanctionCheckMatchPayloadDto,
): SanctionCheckMatchPayload {
  return {
    ...dto,
    schema: isKnownEntitySchema(dto.schema, matchEntitySchemas) ? dto.schema : 'Thing',
  };
}

export type SanctionCheckMatch = {
  id: string;
  entityId: string;
  queryIds: string[];
  status: SanctionCheckMatchStatus;
  enriched: boolean;
  // datasets: unknown[];
  uniqueCounterpartyIdentifier?: string;
  payload: SanctionCheckMatchPayload;
  comments: {
    id: string;
    authorId: string;
    comment: string;
    createdAt: string;
  }[];
};

export function adaptSanctionCheckMatch(dto: SanctionCheckMatchDto): SanctionCheckMatch {
  return {
    id: dto.id,
    entityId: dto.entity_id,
    queryIds: dto.query_ids,
    status: dto.status,
    enriched: dto.enriched,
    payload: adapatSanctionCheckMatchPayload(dto.payload),
    uniqueCounterpartyIdentifier: dto.unique_counterparty_identifier,
    comments: R.map(dto.comments, (comment) => ({
      id: comment.id,
      authorId: comment.author_id,
      comment: comment.comment,
      createdAt: comment.created_at,
    })),
  };
}

export type SanctionCheckQuery = {
  schema: OpenSanctionEntitySchema;
  properties: {
    [key: string]: string[];
  };
};

export type SanctionCheckRequest = {
  threshold: number;
  limit: number;
  queries: {
    [key: string]: SanctionCheckQuery;
  };
};

function adaptQueries(dto: SanctionCheckRequestDto['search_input']['queries']) {
  return R.mapValues(dto, (value) => {
    return {
      schema: isKnownEntitySchema(value.schema, matchEntitySchemas) ? value.schema : 'Thing',
      properties: value.properties,
    };
  });
}

export function adaptSanctionCheckRequest(dto: SanctionCheckRequestDto): SanctionCheckRequest {
  return {
    threshold: dto.threshold,
    limit: dto.limit,
    queries: adaptQueries(dto.search_input.queries),
  };
}

type BaseSanctionCheck = {
  id: string;
  config: {
    name: string;
  };
  decisionId: string;
  partial: boolean;
  isManual: boolean;
  matches: SanctionCheckMatch[];
  initialQuery: {
    schema: SanctionCheckEntityDto;
    properties: Record<string, string[]>;
  }[];
};
export type SanctionCheckError = BaseSanctionCheck & {
  status: 'error';
  request: SanctionCheckRequest | null;
  errorCodes: SanctionCheckErrorDto['error_codes'];
};
export type SanctionCheckNoHit = BaseSanctionCheck & {
  status: 'no_hit';
  request: SanctionCheckRequest | null;
};
export type SanctionCheckSuccess = BaseSanctionCheck & {
  status: Exclude<SanctionCheckStatus, 'error | no_hit'>;
  request: SanctionCheckRequest;
};

export type SanctionCheck = SanctionCheckError | SanctionCheckSuccess | SanctionCheckNoHit;

export function adaptSanctionCheck(dto: SanctionCheckDto): SanctionCheck {
  const baseSanctionCheck: BaseSanctionCheck = {
    id: dto.id,
    decisionId: dto.decision_id,
    partial: dto.partial,
    isManual: dto.is_manual,
    matches: R.map(dto.matches, adaptSanctionCheckMatch),
    config: dto.config,
    initialQuery: dto.initial_query ?? [],
  };

  if (dto.status === 'error') {
    return {
      ...baseSanctionCheck,
      status: dto.status,
      request: dto.request ? adaptSanctionCheckRequest(dto.request) : null,
      errorCodes: dto.error_codes,
    };
  }

  if (dto.status === 'no_hit') {
    return {
      ...baseSanctionCheck,
      status: dto.status,
      request: dto.request ? adaptSanctionCheckRequest(dto.request) : null,
    };
  }

  return {
    ...baseSanctionCheck,
    status: dto.status,
    request: adaptSanctionCheckRequest(dto.request),
  };
}

export function adapatSanctionCheckFile(dto: SanctionCheckFileDto): SanctionCheckFile {
  return {
    id: dto.id,
    fileName: dto.filename,
    createdAt: dto.created_at,
  };
}

export type SanctionCheckFile = {
  id: string;
  fileName: string;
  createdAt: string;
};

export function isSanctionCheckError(
  sanctionCheck: SanctionCheck,
): sanctionCheck is SanctionCheckError {
  return sanctionCheck.status === 'error';
}

export function isSanctionCheckReviewCompleted(sanctionCheck: SanctionCheck) {
  return sanctionCheck.status === 'no_hit' || sanctionCheck.status === 'confirmed_hit';
}

export type ScreeningCategory = 'sanctions' | 'peps' | 'third-parties' | 'adverse-media';

export const SCREENING_CATEGORY_COLORS: Record<ScreeningCategory, string> = {
  sanctions: 'bg-red-95 text-red-43',
  peps: 'bg-blue-96 text-blue-58',
  'third-parties': 'bg-grey-95 text-grey-50',
  'adverse-media': 'bg-yellow-90 text-yellow-50',
};

export const SCREENING_TOPICS_MAP = new Map<string, ScreeningCategory>([
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
  ['fin.adivsor', 'third-parties'],
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
]);
