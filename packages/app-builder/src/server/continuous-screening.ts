import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptContinuousScreeningClientDataIndexingResponse,
  adaptContinuousScreeningConfig,
  adaptContinuousScreeningDatasetUpdateSummary,
  adaptContinuousScreeningObject,
  adaptContinuousScreeningUpdateJobSummary,
  adaptCreateContinuousScreeningConfigDto,
  type ContinuousScreeningClientDataIndexingResponse,
  type ContinuousScreeningConfig,
  type ContinuousScreeningDatasetUpdateSummary,
  type ContinuousScreeningObject,
  type ContinuousScreeningUpdateJobSummary,
  type CreateContinuousScreeningConfig,
  type ListContinuousScreeningClientDataIndexingParams,
  type ListContinuousScreeningDatasetUpdatesParams,
  type ListContinuousScreeningUpdateJobsParams,
} from '@app-builder/models/continuous-screening';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import { adaptPagination, type PaginatedResponse } from '@app-builder/models/pagination';

export async function listConfigurations(api: MarbleCoreApi): Promise<ContinuousScreeningConfig[]> {
  try {
    const configurations = await api.listContinuousScreeningConfigs();
    return configurations.map(adaptContinuousScreeningConfig);
  } catch {
    return [];
  }
}

export async function listDatasetUpdates(
  api: MarbleCoreApi,
  { offsetId, limit, order, sorting }: ListContinuousScreeningDatasetUpdatesParams,
): Promise<PaginatedResponse<ContinuousScreeningDatasetUpdateSummary>> {
  const { items, ...pagination } = await api.listContinuousScreeningDatasetUpdates({
    offsetId,
    limit,
    order,
    sorting,
  });
  return {
    items: items.map(adaptContinuousScreeningDatasetUpdateSummary),
    ...adaptPagination(pagination),
  };
}

export async function listUpdateJobs(
  api: MarbleCoreApi,
  { offsetId, limit, order, sorting }: ListContinuousScreeningUpdateJobsParams,
): Promise<PaginatedResponse<ContinuousScreeningUpdateJobSummary>> {
  const { items, ...pagination } = await api.listContinuousScreeningUpdateJobs({
    offsetId,
    limit,
    order,
    sorting,
  });
  return {
    items: items.map(adaptContinuousScreeningUpdateJobSummary),
    ...adaptPagination(pagination),
  };
}

export async function listClientDataIndexing(
  api: MarbleCoreApi,
  { offsetId, limit, order, sorting }: ListContinuousScreeningClientDataIndexingParams,
): Promise<ContinuousScreeningClientDataIndexingResponse> {
  const result = await api.listContinuousScreeningClientDataIndexing({
    offsetId,
    limit,
    order,
    sorting,
  });
  return adaptContinuousScreeningClientDataIndexingResponse(result);
}

export async function createConfiguration(
  api: MarbleCoreApi,
  configuration: CreateContinuousScreeningConfig,
): Promise<ContinuousScreeningConfig> {
  const result = await api.createContinuousScreeningConfig(adaptCreateContinuousScreeningConfigDto(configuration));
  return adaptContinuousScreeningConfig(result);
}

export async function updateConfiguration(
  api: MarbleCoreApi,
  stableId: string,
  configuration: CreateContinuousScreeningConfig,
): Promise<ContinuousScreeningConfig> {
  const result = await api.updateContinuousScreeningConfig(
    stableId,
    adaptCreateContinuousScreeningConfigDto(configuration),
  );
  return adaptContinuousScreeningConfig(result);
}

export async function listObjects(
  api: MarbleCoreApi,
  { objectType, objectId }: { objectType: string; objectId: string },
): Promise<ContinuousScreeningObject[]> {
  const objects = await api.listContinuousScreeningObjects({
    objectType: [objectType],
    objectId: [objectId],
  });
  return objects.map(adaptContinuousScreeningObject);
}

export async function createObject(
  api: MarbleCoreApi,
  {
    objectType,
    objectId,
    configStableId,
    skipScreen,
  }: {
    objectType: string;
    objectId: string;
    configStableId: string;
    skipScreen?: boolean;
  },
): Promise<void> {
  await api.createContinuousScreeningObject({
    object_type: objectType,
    object_id: objectId,
    config_stable_id: configStableId,
    ...(skipScreen !== undefined ? { skip_screen: skipScreen } : {}),
  });
}

export async function deleteObject(
  api: MarbleCoreApi,
  { objectType, objectId, configStableId }: { objectType: string; objectId: string; configStableId: string },
): Promise<void> {
  try {
    await api.deleteContinuousScreeningObject({
      object_type: objectType,
      object_id: objectId,
      config_stable_id: configStableId,
    });
  } catch (error) {
    // Already removed — treat as success so concurrent create/delete diffs stay resilient.
    if (isNotFoundHttpError(error)) return;
    throw error;
  }
}

export async function updateMatchStatus(
  api: MarbleCoreApi,
  { matchId, status, comment }: { matchId: string; status: 'confirmed_hit' | 'no_hit'; comment?: string },
): Promise<void> {
  await api.updateContinuousScreeningMatch(matchId, {
    status,
    comment,
  });
}

/** Reviews each match on its own: the result of each match comes back in the order of `matches`. */
export async function reviewMatches(
  api: MarbleCoreApi,
  matches: { matchId: string; status: 'confirmed_hit' | 'no_hit'; comment?: string }[],
): Promise<{ matchId: string; statusCode: number; message?: string }[]> {
  const { results } = await api.reviewContinuousScreeningMatches({
    matches: matches.map(({ matchId, status, comment }) => ({ match_id: matchId, status, comment })),
  });
  return results.map(({ match_id, status_code, message }) => ({
    matchId: match_id,
    statusCode: status_code,
    ...(message ? { message } : {}),
  }));
}

export async function dismiss(api: MarbleCoreApi, id: string): Promise<void> {
  await api.dismissContinuousScreening(id);
}
