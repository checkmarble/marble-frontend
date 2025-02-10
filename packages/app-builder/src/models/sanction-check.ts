import {
  type SanctionCheckDto,
  type SanctionCheckFileDto,
  type SanctionCheckMatchDto,
  type SanctionCheckMatchPayloadDto,
  type SanctionCheckRequestDto,
} from 'marble-api';
import * as R from 'remeda';

export type SanctionCheckStatus =
  | 'in_review'
  | 'confirmed_hit'
  | 'no_hit'
  | 'error';
export type SanctionCheckMatchStatus = 'pending' | 'confirmed_hit' | 'no_hit';
export type SanctionCheckEntitySchema =
  | 'Thing'
  | 'LegalEntity'
  | 'Person'
  | 'Organization'
  | 'Company';

export type SanctionCheckMatchPayload = {
  id: string;
  match: boolean;
  score: number;
  schema: SanctionCheckEntitySchema;
  caption: string;
  properties: Record<string, string[]>;
};

export function adapatSanctionCheckMatchPayload(
  dto: SanctionCheckMatchPayloadDto,
): SanctionCheckMatchPayload {
  return dto;
}

export type SanctionCheckMatch = {
  id: string;
  entityId: string;
  queryIds: string[];
  status: SanctionCheckMatchStatus;
  // datasets: unknown[];
  payload: SanctionCheckMatchPayload;
  comments: {
    id: string;
    authorId: string;
    comment: string;
    createdAt: string;
  }[];
};

export function adaptSanctionCheckMatch(
  dto: SanctionCheckMatchDto,
): SanctionCheckMatch {
  return {
    id: dto.id,
    entityId: dto.entity_id,
    queryIds: dto.query_ids,
    status: dto.status,
    payload: adapatSanctionCheckMatchPayload(dto.payload),
    comments: R.map(dto.comments, (comment) => ({
      id: comment.id,
      authorId: comment.author_id,
      comment: comment.comment,
      createdAt: comment.created_at,
    })),
  };
}

export type SanctionCheckQuery = {
  schema: SanctionCheckEntitySchema;
  properties: {
    [key: string]: string[];
  };
};

export type SanctionCheckRequest = {
  threshold: number;
  queries: {
    [key: string]: SanctionCheckQuery;
  };
};

export function adaptSanctionCheckRequest(
  dto: SanctionCheckRequestDto,
): SanctionCheckRequest {
  return {
    threshold: dto.threshold,
    queries: dto.search_input.queries,
  };
}

export type SanctionCheck = {
  id: string;
  decisionId: string;
  status: SanctionCheckStatus;
  request: SanctionCheckRequest;
  partial: boolean;
  count: number;
  isManual: boolean;
  matches: SanctionCheckMatch[];
};

export function adaptSanctionCheck(dto: SanctionCheckDto): SanctionCheck {
  return {
    id: dto.id,
    decisionId: dto.decision_id,
    status: dto.status,
    request: adaptSanctionCheckRequest(dto.request),
    partial: dto.partial,
    count: dto.count,
    isManual: dto.is_manual,
    matches: R.map(dto.matches, adaptSanctionCheckMatch),
  };
}

export function adapatSanctionCheckFile(
  dto: SanctionCheckFileDto,
): SanctionCheckFile {
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
