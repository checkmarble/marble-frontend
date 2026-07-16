import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptContinuousScreeningClientDataIndexingResponse,
  adaptContinuousScreeningConfig,
  adaptContinuousScreeningDatasetUpdateSummary,
  adaptContinuousScreeningUpdateJobSummary,
  adaptContinuousScreeningObject,
  adaptCreateContinuousScreeningConfigDto,
  ContinuousScreeningClientDataIndexingResponse,
  ContinuousScreeningConfig,
  ContinuousScreeningDatasetUpdateSummary,
  ContinuousScreeningUpdateJobSummary,
  ContinuousScreeningObject,
  CreateContinuousScreeningConfig,
  ListContinuousScreeningClientDataIndexingParams,
  ListContinuousScreeningDatasetUpdatesParams,
  ListContinuousScreeningUpdateJobsParams,
} from '@app-builder/models/continuous-screening';
import { adaptPagination, type PaginatedResponse } from '@app-builder/models/pagination';

export interface ContinuousScreeningRepository {
  listConfigurations(): Promise<ContinuousScreeningConfig[]>;
  listDatasetUpdates(
    params: ListContinuousScreeningDatasetUpdatesParams,
  ): Promise<PaginatedResponse<ContinuousScreeningDatasetUpdateSummary>>;
  listUpdateJobs(
    params: ListContinuousScreeningUpdateJobsParams,
  ): Promise<PaginatedResponse<ContinuousScreeningUpdateJobSummary>>;
  listClientDataIndexing(
    params: ListContinuousScreeningClientDataIndexingParams,
  ): Promise<ContinuousScreeningClientDataIndexingResponse>;
  createConfiguration(configuration: CreateContinuousScreeningConfig): Promise<ContinuousScreeningConfig>;
  updateConfiguration(
    stableId: string,
    configuration: CreateContinuousScreeningConfig,
  ): Promise<ContinuousScreeningConfig>;
  getConfiguration(stableId: string): Promise<ContinuousScreeningConfig>;
  listObjects(filters: { objectType: string; objectId: string }): Promise<ContinuousScreeningObject[]>;
  createObject(payload: { objectType: string; objectId: string; configStableId: string }): Promise<void>;
  deleteObject(payload: { objectType: string; objectId: string; configStableId: string }): Promise<void>;
  updateMatchStatus(payload: { matchId: string; status: 'confirmed_hit' | 'no_hit'; comment?: string }): Promise<any>;
  dismiss(id: string): Promise<void>;
  loadMoreMatches(id: string): Promise<void>;
}

export function makeGetContinuousScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ContinuousScreeningRepository => ({
    listConfigurations: async () => {
      try {
        const configurations = await marbleCoreApiClient.listContinuousScreeningConfigs();
        return configurations.map(adaptContinuousScreeningConfig);
      } catch {
        return [];
      }
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
    listUpdateJobs: async ({ offsetId, limit, order, sorting }) => {
      const { items, ...pagination } = await marbleCoreApiClient.listContinuousScreeningUpdateJobs({
        offsetId,
        limit,
        order,
        sorting,
      });
      return {
        items: items.map(adaptContinuousScreeningUpdateJobSummary),
        ...adaptPagination(pagination),
      };
    },
    listClientDataIndexing: async ({ offsetId, limit, order, sorting }) => {
      const result = await marbleCoreApiClient.listContinuousScreeningClientDataIndexing({
        offsetId,
        limit,
        order,
        sorting,
      });
      return adaptContinuousScreeningClientDataIndexingResponse(result);
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
    listObjects: async ({ objectType, objectId }) => {
      const objects = await marbleCoreApiClient.listContinuousScreeningObjects({
        objectType: [objectType],
        objectId: [objectId],
      });
      return objects.map(adaptContinuousScreeningObject);
    },
    createObject: async ({ objectType, objectId, configStableId }) => {
      await marbleCoreApiClient.createContinuousScreeningObject({
        object_type: objectType,
        object_id: objectId,
        config_stable_id: configStableId,
      });
    },
    deleteObject: async ({ objectType, objectId, configStableId }) => {
      await marbleCoreApiClient.deleteContinuousScreeningObject({
        object_type: objectType,
        object_id: objectId,
        config_stable_id: configStableId,
      });
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
