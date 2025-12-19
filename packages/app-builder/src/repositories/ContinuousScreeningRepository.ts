import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptContinuousScreeningConfig,
  adaptCreateContinuousScreeningConfigDto,
  ContinuousScreeningConfig,
  CreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';

export interface ContinuousScreeningRepository {
  listConfigurations(): Promise<ContinuousScreeningConfig[]>;
  createConfiguration(configuration: CreateContinuousScreeningConfig): Promise<ContinuousScreeningConfig>;
  getConfiguration(stableId: string): Promise<ContinuousScreeningConfig>;
}

export function makeGetContinuousScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ContinuousScreeningRepository => ({
    listConfigurations: async () => {
      const configurations = await marbleCoreApiClient.listContinuousScreeningConfigs();
      return configurations.map(adaptContinuousScreeningConfig);
    },
    createConfiguration: async (configuration) => {
      const result = await marbleCoreApiClient.createContinuousScreeningConfig(
        adaptCreateContinuousScreeningConfigDto(configuration),
      );
      return adaptContinuousScreeningConfig(result);
    },
    getConfiguration: async (stableId) => {
      const result = await marbleCoreApiClient.getContinuousScreeningConfig(stableId);
      return adaptContinuousScreeningConfig(result);
    },
  });
}
