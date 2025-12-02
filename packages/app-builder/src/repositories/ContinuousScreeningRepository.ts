import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptContinuousScreeningConfig, ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';

export interface ContinuousScreeningRepository {
  listConfigurations(): Promise<ContinuousScreeningConfig[]>;
}

export function makeGetContinuousScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ContinuousScreeningRepository => ({
    listConfigurations: async () => {
      const configurations = await marbleCoreApiClient.listContinuousScreeningConfigs();
      return configurations.map(adaptContinuousScreeningConfig);
    },
  });
}
