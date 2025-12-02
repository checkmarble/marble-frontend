import { ContinuousScreeningConfigDto } from 'marble-api';

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
