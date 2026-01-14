import {
  ContinuousScreeningConfigDto,
  ContinuousScreeningDto,
  ContinuousScreeningMappingConfigDto,
  ContinuousScreeningMatchBaseDto,
  ContinuousScreeningMatchMarbleDto,
  ContinuousScreeningMatchScreeningEntityDto,
  ContinuousScreeningRequestDto,
  CreateContinuousScreeningConfigDto,
  FtmEntity,
  OpenSanctionsEntityDto,
  ScreeningQueryDto,
} from 'marble-api';
import * as R from 'remeda';
import {
  adaptScreeningMatchPayload,
  isKnownEntitySchema,
  matchEntitySchemas,
  OpenSanctionEntitySchema,
  ScreeningMatchPayload,
} from './screening';

export type ContinuousScreeningConfig = {
  id: string;
  stableId: string;
  name: string;
  description?: string;
  inboxId: string;
  objectTypes: string[];
  algorithm: string;
  datasets: string[];
  matchThreshold: number;
  matchLimit: number;
  enabled: boolean;
};

export function adaptContinuousScreeningConfig(config: ContinuousScreeningConfigDto): ContinuousScreeningConfig {
  return {
    id: config.id,
    stableId: config.stable_id,
    name: config.name,
    description: config.description,
    inboxId: config.inbox_id,
    objectTypes: config.object_types,
    algorithm: config.algorithm,
    datasets: config.datasets,
    matchThreshold: config.match_threshold,
    matchLimit: config.match_limit,
    enabled: config.enabled,
  };
}

export type CreateMappingConfig = {
  objectType: string;
  ftmEntity: FtmEntity;
  fieldMapping: Record<string, string | null>;
};

export type PrevalidationCreateContinuousScreeningConfig = {
  name: string;
  description: string;
  inboxId: string | null;
  inboxName: string | null;
  datasets: Record<string, boolean>;
  matchThreshold: number;
  matchLimit: number;
  algorithm?: string;
  mappingConfigs: CreateMappingConfig[];
};

export type CreateContinuousScreeningConfig = {
  name: string;
  description: string;
  inboxId: string;
  datasets: Record<string, boolean>;
  matchThreshold: number;
  matchLimit: number;
  algorithm?: string;
  mappingConfigs: CreateMappingConfig[];
};

export function adaptCreateContinuousScreeningConfigDto(
  configuration: CreateContinuousScreeningConfig,
): CreateContinuousScreeningConfigDto {
  return {
    name: configuration.name,
    description: configuration.description,
    object_types: configuration.mappingConfigs.map((mc) => mc.objectType),
    algorithm: configuration.algorithm,
    datasets: Object.entries(configuration.datasets)
      .filter(([_, value]) => value)
      .map(([key]) => key),
    inbox_id: configuration.inboxId,
    match_threshold: configuration.matchThreshold,
    match_limit: configuration.matchLimit,
    mapping_configs: configuration.mappingConfigs.map<ContinuousScreeningMappingConfigDto>((mc) => {
      return {
        object_type: mc.objectType,
        ftm_entity: mc.ftmEntity,
        object_field_mappings: R.pipe(
          Object.entries(mc.fieldMapping),
          R.filter((fieldMapping): fieldMapping is [string, string] => fieldMapping[1] !== null),
          R.map(([objectFieldId, ftmProperty]) => {
            return { object_field_id: objectFieldId, ftm_property: ftmProperty };
          }),
        ),
      };
    }),
  };
}

export type ContinuousScreeningBase = {
  id: string;
  organizationId: string;
  continuousScreeningConfigId: string;
  continuousScreeningConfigStableId: string;
  caseId?: string;
  status: 'in_review' | 'confirmed_hit' | 'no_hit';
  request: ContinuousScreeningRequest;
  partial: boolean;
  numberOfMatches: number;
};

export type ContinuousScreeningMarbleToScreeningEntity = ContinuousScreeningBase & {
  triggerType: 'object_added' | 'object_updated';
  objectType: string;
  objectId: string;
  objectInternalId: string;
  matches: ContinuousScreeningMatchScreeningEntity[];
};

export type OpenSanctionEntityPayload = {
  id: string;
  caption: string;
  schema: OpenSanctionEntitySchema;
  properties: Record<string, string[]>;
  datasets: string[];
};

export type ContinuousScreeningScreeningEntityToMarble = ContinuousScreeningBase & {
  triggerType: 'dataset_updated';
  opensanctionEntityId: string;
  opensanctionEntityPayload: OpenSanctionEntityPayload;
  matches: ContinuousScreeningMatchMarble[];
};

export type ContinuousScreening =
  | ContinuousScreeningMarbleToScreeningEntity
  | ContinuousScreeningScreeningEntityToMarble;

export type ContinuousScreeningRequest = {
  searchInput: {
    queries: {
      [key: string]: ScreeningQueryDto;
    };
  };
};

export type ContinuousScreeningMatchBase = {
  id: string;
  continuousScreeningId: string;
  status: ContinuousScreeningMatchBaseDto['status'];
  payload: ContinuousScreeningMatchPayload;
};

export type ContinuousScreeningMatchScreeningEntity = ContinuousScreeningMatchBase & {
  opensanctionEntityId: string;
};

export type ContinuousScreeningMatchMarble = ContinuousScreeningMatchBase & {
  objectType: string;
  objectId: string;
};

export type ContinuousScreeningMatch = ContinuousScreeningMatchScreeningEntity | ContinuousScreeningMatchMarble;

export type ContinuousScreeningMatchPayload = ScreeningMatchPayload & {
  datasets: string[];
  target: boolean;
};

export function adaptContinuousScreening(dto: ContinuousScreeningDto): ContinuousScreening {
  const baseContinuousScreening: ContinuousScreeningBase = {
    id: dto.id,
    organizationId: dto.org_id,
    continuousScreeningConfigId: dto.continuous_screening_config_id,
    continuousScreeningConfigStableId: dto.continuous_screening_config_stable_id,
    caseId: dto.case_id,
    status: dto.status,
    request: adaptContinuousScreeningRequest(dto.request),
    partial: dto.partial,
    numberOfMatches: dto.number_of_matches,
  };

  if (dto.trigger_type === 'dataset_updated') {
    return {
      ...baseContinuousScreening,
      triggerType: 'dataset_updated',
      opensanctionEntityId: dto.opensanction_entity_id,
      opensanctionEntityPayload: adaptOpenSanctionsEntityPayload(dto.opensanction_entity_payload),
      matches: dto.matches.map(adaptContinuousScreeningMatchMarble),
    };
  }

  return {
    ...baseContinuousScreening,
    triggerType: dto.trigger_type,
    objectType: dto.object_type,
    objectId: dto.object_id,
    objectInternalId: dto.object_internal_id,
    matches: dto.matches.map(adaptContinuousScreeningMatchScreeningEntity),
  };
}

export function adaptContinuousScreeningRequest(dto: ContinuousScreeningRequestDto): ContinuousScreeningRequest {
  return {
    searchInput: {
      queries: dto.search_input.queries,
    },
  };
}

export function adaptContinuousScreeningMatchMarble(
  dto: ContinuousScreeningMatchMarbleDto,
): ContinuousScreeningMatchMarble {
  return {
    id: dto.id,
    continuousScreeningId: dto.continuous_screening_id,
    status: dto.status,
    objectType: dto.object_type,
    objectId: dto.object_id,
    payload: {
      ...adaptScreeningMatchPayload(dto.payload),
      target: dto.payload.target,
      datasets: dto.payload.datasets,
    },
  };
}

export function adaptContinuousScreeningMatchScreeningEntity(
  dto: ContinuousScreeningMatchScreeningEntityDto,
): ContinuousScreeningMatchScreeningEntity {
  return {
    id: dto.id,
    continuousScreeningId: dto.continuous_screening_id,
    status: dto.status,
    opensanctionEntityId: dto.opensanction_entity_id,
    payload: {
      ...adaptScreeningMatchPayload(dto.payload),
      target: dto.payload.target,
      datasets: dto.payload.datasets,
    },
  };
}

export function adaptOpenSanctionsEntityPayload(dto: OpenSanctionsEntityDto): OpenSanctionEntityPayload {
  return {
    ...dto,
    schema: isKnownEntitySchema(dto.schema, matchEntitySchemas) ? dto.schema : 'Thing',
  };
}

export const isDirectContinuousScreening = (
  screening: ContinuousScreening,
): screening is ContinuousScreeningMarbleToScreeningEntity => {
  return screening.triggerType === 'object_added' || screening.triggerType === 'object_updated';
};

export const isIndirectContinuousScreening = (
  screening: ContinuousScreening,
): screening is ContinuousScreeningScreeningEntityToMarble => {
  return screening.triggerType === 'dataset_updated';
};

export const isDirectContinuousScreeningMatch = (
  match: ContinuousScreeningMatch,
): match is ContinuousScreeningMatchScreeningEntity => {
  return 'opensanctionEntityId' in match;
};

export const isIndirectContinuousScreeningMatch = (
  match: ContinuousScreeningMatch,
): match is ContinuousScreeningMatchMarble => {
  return 'objectType' in match && 'objectId' in match;
};
