import {
  ContinuousScreeningConfigDto,
  ContinuousScreeningDto,
  ContinuousScreeningMappingConfigDto,
  ContinuousScreeningMatchDto,
  ContinuousScreeningRequestDto,
  CreateContinuousScreeningConfigDto,
  FtmEntity,
  ScreeningQueryDto,
} from 'marble-api';
import * as R from 'remeda';
import { adaptScreeningMatchPayload, ScreeningMatchPayload } from './screening';

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

export type ContinuousScreening = {
  id: string;
  organizationId: string;
  continuousScreeningConfigId: string;
  continuousScreeningConfigStableId: string;
  caseId?: string;
  objectType: string;
  objectId: string;
  objectInternalId: string;
  status: string;
  triggerType: string;
  request: ContinuousScreeningRequest;
  partial: boolean;
  numberOfMatches: number;
  matches: ContinuousScreeningMatch[];
};

export type ContinuousScreeningRequest = {
  searchInput: {
    queries: {
      [key: string]: ScreeningQueryDto;
    };
  };
};

export type ContinuousScreeningMatch = {
  id: string;
  continuousScreeningId: string;
  opensanctionEntityId: string;
  status: ContinuousScreeningMatchDto['status'];
  payload: ContinuousScreeningMatchPayload;
};

export type ContinuousScreeningMatchPayload = ScreeningMatchPayload & {
  datasets: string[];
  target: boolean;
};

export function adaptContinuousScreening(dto: ContinuousScreeningDto): ContinuousScreening {
  return {
    id: dto.id,
    organizationId: dto.org_id,
    continuousScreeningConfigId: dto.continuous_screening_config_id,
    continuousScreeningConfigStableId: dto.continuous_screening_config_stable_id,
    caseId: dto.case_id,
    objectType: dto.object_type,
    objectId: dto.object_id,
    objectInternalId: dto.object_internal_id,
    status: dto.status,
    triggerType: dto.trigger_type,
    request: adaptContinuousScreeningRequest(dto.request),
    partial: dto.partial,
    numberOfMatches: dto.number_of_matches,
    matches: dto.matches.map(adaptContinuousScreeningMatch),
  };
}

export function adaptContinuousScreeningRequest(dto: ContinuousScreeningRequestDto): ContinuousScreeningRequest {
  return {
    searchInput: {
      queries: dto.search_input.queries,
    },
  };
}

export function adaptContinuousScreeningMatch(dto: ContinuousScreeningMatchDto): ContinuousScreeningMatch {
  return {
    id: dto.id,
    continuousScreeningId: dto.continuous_screening_id,
    opensanctionEntityId: dto.opensanction_entity_id,
    status: dto.status,
    payload: {
      ...adaptScreeningMatchPayload(dto.payload),
      target: dto.payload.target,
      datasets: dto.payload.datasets,
    },
  };
}
