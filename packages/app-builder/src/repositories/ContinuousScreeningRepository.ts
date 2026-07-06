import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptContinuousScreeningConfig,
  adaptContinuousScreeningDatasetUpdateSummary,
  adaptCreateContinuousScreeningConfigDto,
  ContinuousScreeningConfig,
  ContinuousScreeningDatasetUpdateSummary,
  CreateContinuousScreeningConfig,
  ListContinuousScreeningDatasetUpdatesParams,
} from '@app-builder/models/continuous-screening';
import { adaptPagination, type PaginatedResponse } from '@app-builder/models/pagination';

export interface ContinuousScreeningRepository {
  listConfigurations(): Promise<ContinuousScreeningConfig[]>;
  listDatasetUpdates(
    params: ListContinuousScreeningDatasetUpdatesParams,
  ): Promise<PaginatedResponse<ContinuousScreeningDatasetUpdateSummary>>;
  createConfiguration(configuration: CreateContinuousScreeningConfig): Promise<ContinuousScreeningConfig>;
  updateConfiguration(
    stableId: string,
    configuration: CreateContinuousScreeningConfig,
  ): Promise<ContinuousScreeningConfig>;
  getConfiguration(stableId: string): Promise<ContinuousScreeningConfig>;
  updateMatchStatus(payload: { matchId: string; status: 'confirmed_hit' | 'no_hit'; comment?: string }): Promise<any>;
  dismiss(id: string): Promise<void>;
  loadMoreMatches(id: string): Promise<void>;
}

export function makeGetContinuousScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ContinuousScreeningRepository => ({
    listConfigurations: async () => {
      const configurations = await marbleCoreApiClient.listContinuousScreeningConfigs();
      return configurations.map(adaptContinuousScreeningConfig);
    },
    listDatasetUpdates: async ({ offsetId, limit, order, sorting }) => {
      const { items, ...pagination } = await marbleCoreApiClient.listContinuousScreeningDatasetUpdates({
        offsetId,
        limit,
        order,
        sorting,
      });
      return {
        items: items.map(adaptContinuousScreeningDatasetUpdateSummary),
        ...adaptPagination(pagination),
      };
    },
    createConfiguration: async (configuration) => {
      const result = await marbleCoreApiClient.createContinuousScreeningConfig(
        adaptCreateContinuousScreeningConfigDto(configuration),
      );
      return adaptContinuousScreeningConfig(result);
    },
    updateConfiguration: async (stableId, configuration) => {
      const result = await marbleCoreApiClient.updateContinuousScreeningConfig(
        stableId,
        adaptCreateContinuousScreeningConfigDto(configuration),
      );
      return adaptContinuousScreeningConfig(result);
    },
    getConfiguration: async (stableId) => {
      const result = await marbleCoreApiClient.getContinuousScreeningConfig(stableId);
      return adaptContinuousScreeningConfig(result);
    },
    updateMatchStatus: async ({ matchId, status, comment }) => {
      await marbleCoreApiClient.updateContinuousScreeningMatch(matchId, {
        status,
        comment,
      });
    },
    dismiss: async (id: string) => {
      await marbleCoreApiClient.dismissContinuousScreening(id);
    },
    loadMoreMatches: async (id: string) => {
      await marbleCoreApiClient.loadMoreContinuousScreeningMatches(id);
    },
  });
}
