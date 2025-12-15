import {
  ContinuousScreeningConfigDto,
  ContinuousScreeningMappingConfigDto,
  CreateContinuousScreeningConfigDto,
  FtmEntity,
} from 'marble-api';
import * as R from 'remeda';

export type ContinuousScreeningConfig = {
  id: string;
  stableId: string;
  name: string;
  description: string | undefined;
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
