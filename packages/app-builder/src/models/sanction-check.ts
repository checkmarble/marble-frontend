import type {
  SanctionCheckDto,
  SanctionCheckErrorDto,
  SanctionCheckFileDto,
  SanctionCheckMatchDto,
  SanctionCheckMatchPayloadDto,
  SanctionCheckRequestDto,
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
>;

export type SanctionCheckMatchPayload = {
  id: string;
  match: boolean;
  score: number;
  schema: SanctionCheckMatchEntitySchema;
  caption: string;
  properties: {
    sanctions?: SanctionCheckSanctionEntity[];
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
  decisionId: string;
  partial: boolean;
  isManual: boolean;
  matches: SanctionCheckMatch[];
};
export type SanctionCheckError = BaseSanctionCheck & {
  status: 'error';
  request: SanctionCheckRequest | null;
  errorCodes: SanctionCheckErrorDto['error_codes'];
};
export type SanctionCheckSuccess = BaseSanctionCheck & {
  status: Exclude<SanctionCheckStatus, 'error'>;
  request: SanctionCheckRequest;
};

export type SanctionCheck = SanctionCheckError | SanctionCheckSuccess;

export function adaptSanctionCheck(dto: SanctionCheckDto): SanctionCheck {
  const baseSanctionCheck: BaseSanctionCheck = {
    id: dto.id,
    decisionId: dto.decision_id,
    partial: dto.partial,
    isManual: dto.is_manual,
    matches: R.map(dto.matches, adaptSanctionCheckMatch),
  };

  if (dto.status === 'error') {
    return {
      ...baseSanctionCheck,
      status: dto.status,
      request: dto.request ? adaptSanctionCheckRequest(dto.request) : null,
      errorCodes: dto.error_codes,
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
