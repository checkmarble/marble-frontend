import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptSavedFreeformSearchPreset,
  adaptSaveFreeformSearchPresetDto,
  type FreeformSearchPreset,
  type SavedFreeformSearchPreset,
} from '@app-builder/models/freeform-search-preset';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import {
  type AvailableFeatures,
  adaptScreening,
  adaptScreeningMatch,
  adaptScreeningMatchPayload,
  type OpenSanctionEntitySchema,
  type SavedScreeningSearchFilters,
  type SavedScreeningSearchPage,
  type Screening,
  type ScreeningAvailableFiltersAdapted,
  type ScreeningMatch,
  type ScreeningMatchPayload,
  type ScreeningMatchStatus,
} from '@app-builder/models/screening';
import { createScreeningFilters } from '@app-builder/models/screening-config';
import { type OpenSanctionsCatalogDto } from 'marble-api';
import * as R from 'remeda';

export async function listScreenings(api: MarbleCoreApi, { decisionId }: { decisionId: string }): Promise<Screening[]> {
  try {
    return R.map(await api.listScreenings(decisionId), adaptScreening);
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return [];
    }
    throw error;
  }
}

export async function listDatasets(api: MarbleCoreApi): Promise<OpenSanctionsCatalogDto> {
  try {
    return await api.listOpenSanctionDatasets();
  } catch {
    // The datasets service can be unavailable (404, 500, etc.); callers render an empty catalog.
    return { sections: [] };
  }
}

export async function updateMatchStatus(
  api: MarbleCoreApi,
  {
    matchId,
    status,
    comment,
    whitelist,
  }: {
    matchId: string;
    status: Extract<ScreeningMatchStatus, 'no_hit' | 'confirmed_hit'>;
    comment?: string;
    whitelist?: boolean;
  },
): Promise<ScreeningMatch> {
  return adaptScreeningMatch(await api.updateScreeningMatch(matchId, { status, comment, whitelist }));
}

export async function searchScreeningMatches(
  api: MarbleCoreApi,
  {
    screeningId,
    entityType,
    fields,
  }: {
    screeningId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  },
): Promise<ScreeningMatchPayload[]> {
  const dto = {
    screening_id: screeningId,
    query: {
      [entityType]: fields,
    },
  };
  return R.map(await api.searchScreeningMatches(dto), adaptScreeningMatchPayload);
}

export async function refineScreening(
  api: MarbleCoreApi,
  {
    screeningId,
    entityType,
    fields,
  }: {
    screeningId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  },
): Promise<Screening> {
  const dto = {
    screening_id: screeningId,
    query: {
      [entityType]: fields,
    },
  };
  return adaptScreening(await api.refineScreening(dto));
}

export async function freeformSearch(
  api: MarbleCoreApi,
  {
    entityType,
    fields,
    datasets,
    threshold,
    limit,
  }: {
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
    datasets?: string[];
    threshold?: number;
    limit?: number;
  },
): Promise<{ id: string; matches: ScreeningMatchPayload[] }> {
  const dto = {
    query: {
      [entityType]: fields,
    },
    datasets: [],
    filters: createScreeningFilters(datasets ?? []),
    threshold,
  };
  const { id, matches } = await api.freeformSearch(dto, { limit });
  return {
    id,
    matches: R.map(matches, (match) => adaptScreeningMatchPayload(match)),
  };
}

export async function getAvailableFilters(
  api: MarbleCoreApi,
  { feature }: { feature: AvailableFeatures },
): Promise<ScreeningAvailableFiltersAdapted> {
  try {
    return await api.listScreeningAvailableFilters(feature);
  } catch {
    // The screening service can be unavailable (404, 500, etc.); callers render no filters.
    return { provider: 'opensanctions', sections: {} };
  }
}

export async function listSavedScreeningSearches(
  api: MarbleCoreApi,
  { isSaved, userId, apiKeyId, offsetId, limit, createdAfter, createdBefore }: SavedScreeningSearchFilters,
): Promise<SavedScreeningSearchPage> {
  return await api.listFreeformSearches({
    savedOnly: isSaved,
    userId,
    apiKeyId,
    offsetId,
    limit,
    createdAfter,
    createdBefore,
  });
}

export async function getFreeformSearch(
  api: MarbleCoreApi,
  { id }: { id: string },
): Promise<{ id: string; matches: ScreeningMatchPayload[] }> {
  const res = await api.getFreeformSearch(id);
  return {
    id: res.id,
    matches: res.matches ? R.map(res.matches, (match) => adaptScreeningMatchPayload(match)) : [],
  };
}

export async function listFreeformSearchPresets(api: MarbleCoreApi): Promise<SavedFreeformSearchPreset[]> {
  return (await api.listScreeningSavedSearches()).map(adaptSavedFreeformSearchPreset);
}

export async function saveFreeformSearchPreset(
  api: MarbleCoreApi,
  { name, value }: { name: string; value: FreeformSearchPreset },
): Promise<SavedFreeformSearchPreset> {
  const result = await api.saveScreeningSearch(adaptSaveFreeformSearchPresetDto(name, value));
  return adaptSavedFreeformSearchPreset(result);
}

export async function deleteFreeformSearchPreset(api: MarbleCoreApi, { id }: { id: string }): Promise<void> {
  await api.deleteScreeningSavedSearch(id);
}
