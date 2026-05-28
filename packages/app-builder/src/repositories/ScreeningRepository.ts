import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import {
  type AvailableFeatures,
  adaptScreening,
  adaptScreeningFile,
  adaptScreeningMatch,
  adaptScreeningMatchPayload,
  type OpenSanctionEntitySchema,
  type SavedScreeningSearch,
  type SavedScreeningSearchFilters,
  type SavedScreeningSearchInputs,
  type SavedScreeningSearchPage,
  type Screening,
  ScreeningAvailableFiltersAdapted,
  type ScreeningFile,
  type ScreeningMatch,
  type ScreeningMatchPayload,
  type ScreeningMatchStatus,
} from '@app-builder/models/screening';
import { adaptScreeningAiSuggestion, type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import { createScreeningFilters } from '@app-builder/models/screening-config';
import {
  adaptOpenSanctionsDatasetFreshness,
  type OpenSanctionsDatasetFreshness,
} from '@app-builder/models/screening-dataset';
import { type OpenSanctionsCatalogDto } from 'marble-api';
import * as R from 'remeda';
export interface ScreeningRepository {
  listScreenings(args: { decisionId: string }): Promise<Screening[]>;
  listDatasets(): Promise<OpenSanctionsCatalogDto>;
  getDatasetFreshness(): Promise<OpenSanctionsDatasetFreshness>;
  updateMatchStatus(args: {
    matchId: string;
    status: Extract<ScreeningMatchStatus, 'no_hit' | 'confirmed_hit'>;
    comment?: string;
    whitelist?: boolean;
  }): Promise<ScreeningMatch>;
  searchScreeningMatches(args: {
    screeningId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  }): Promise<ScreeningMatchPayload[]>;
  refineScreening(args: {
    screeningId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  }): Promise<Screening>;
  listScreeningFiles(args: { screeningId: string }): Promise<ScreeningFile[]>;
  enrichMatch(args: { matchId: string }): Promise<ScreeningMatch>;
  freeformSearch(args: {
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
    datasets?: string[];
    threshold?: number;
    limit?: number;
  }): Promise<ScreeningMatchPayload[]>;
  getAiSuggestions(args: { screeningId: string }): Promise<ScreeningAiSuggestion[]>;
  enrichedData(args: { entityId: string }): Promise<ScreeningMatchPayload>;
  getAvailableFilters(args: { feature: AvailableFeatures }): Promise<ScreeningAvailableFiltersAdapted>;
  saveScreeningSearch(args: {
    name: string;
    inputs: SavedScreeningSearchInputs;
    results: ScreeningMatchPayload[];
  }): Promise<SavedScreeningSearch>;
  listSavedScreeningSearches(filters: SavedScreeningSearchFilters): Promise<SavedScreeningSearchPage>;
  deleteSavedScreeningSearch(args: { id: string }): Promise<void>;
}

// In-memory mock store for saved freeform searches. Replace once a marblecore-api endpoint exists.
const savedScreeningSearches = new Map<string, SavedScreeningSearch>();
const MOCK_SAVED_SEARCH_OWNER_ID = 'mock-owner';

export function makeGetScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ScreeningRepository => ({
    getAvailableFilters: async ({ feature }) => {
      const listFeature: ScreeningAvailableFiltersAdapted =
        await marbleCoreApiClient.listScreeningAvailableFilters(feature);

      // listFeature.conditional_filters = [
      //   {
      //     key: 'kind_of_peps',
      //     name: 'kind_of_peps_options',
      //     topics: [
      //       { name: 'primary.option1', title: 'Primary PEP option 1' },
      //       { name: 'primary.option2', title: 'Primary PEP option 2' },
      //       { name: 'primary.option3', title: 'Primary PEP option 3' },
      //       { name: 'primary.option4', title: 'Primary PEP option 4' },
      //       { name: 'option5', title: 'Any PEP option 5' },
      //       { name: 'option6', title: 'Any PEP option 6' },
      //       { name: 'option7', title: 'Any PEP option 7' },
      //       { name: 'option8', title: 'Any PEP option 8' },
      //       { name: 'option9', title: 'Any PEP option 9' },
      //       { name: 'option10', title: 'Any PEP option 10' },
      //     ],
      //   },
      // ];
      return listFeature;
    },
    listDatasets: async () => {
      try {
        return await marbleCoreApiClient.listOpenSanctionDatasets();
      } catch {
        // Return empty catalog if datasets service fails (404, 500, etc.)
        return { sections: [] };
      }
    },
    getDatasetFreshness: async () => {
      return adaptOpenSanctionsDatasetFreshness(await marbleCoreApiClient.getDatasetsFreshness());
    },
    listScreenings: async ({ decisionId }) => {
      try {
        return R.map(await marbleCoreApiClient.listScreenings(decisionId), adaptScreening);
      } catch (error) {
        // Return empty array if decision not found (404)
        if (isNotFoundHttpError(error)) {
          return [];
        }
        throw error;
      }
    },
    updateMatchStatus: async ({ matchId, status, comment, whitelist }) => {
      return adaptScreeningMatch(
        await marbleCoreApiClient.updateScreeningMatch(matchId, {
          status,
          comment,
          whitelist,
        }),
      );
    },
    searchScreeningMatches: async ({ screeningId, entityType, fields }) => {
      const dto = {
        screening_id: screeningId,
        query: {
          [entityType]: fields,
        },
      };
      return R.map(await marbleCoreApiClient.searchScreeningMatches(dto), adaptScreeningMatchPayload);
    },
    enrichedData: async ({ entityId }) => {
      return adaptScreeningMatchPayload(await marbleCoreApiClient.getEnrichedData(entityId));
    },
    refineScreening: async ({ screeningId, entityType, fields }) => {
      const dto = {
        screening_id: screeningId,
        query: {
          [entityType]: fields,
        },
      };
      return adaptScreening(await marbleCoreApiClient.refineScreening(dto));
    },
    listScreeningFiles: async ({ screeningId }) => {
      return R.map(await marbleCoreApiClient.listScreeningFiles(screeningId), adaptScreeningFile);
    },
    enrichMatch: async ({ matchId }) => {
      return adaptScreeningMatch(await marbleCoreApiClient.enrichScreeningMatch(matchId));
    },
    freeformSearch: async ({ entityType, fields, datasets, threshold, limit }) => {
      const dto = {
        query: {
          [entityType]: fields,
        },
        datasets: [],
        filters: createScreeningFilters(datasets ?? []),
        threshold,
      };
      const results = await marbleCoreApiClient.freeformSearch(dto, { limit });
      return R.map(results, (result) => adaptScreeningMatchPayload(result.payload));
    },
    getAiSuggestions: async ({ screeningId }) => {
      return R.map(await marbleCoreApiClient.getScreeningAiSuggestions(screeningId), adaptScreeningAiSuggestion);
    },
    saveScreeningSearch: async ({ name, inputs, results }) => {
      const record: SavedScreeningSearch = {
        id: crypto.randomUUID(),
        name,
        ownerId: MOCK_SAVED_SEARCH_OWNER_ID,
        createdAt: new Date().toISOString(),
        inputs,
        results,
      };
      savedScreeningSearches.set(record.id, record);
      return record;
    },
    listSavedScreeningSearches: async (filters) => {
      const all = Array.from(savedScreeningSearches.values());

      const filtered = R.pipe(
        all,
        R.filter((s) => {
          if (filters.name && !s.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
          if (filters.ownerId && s.ownerId !== filters.ownerId) return false;
          if (filters.fromDate && s.createdAt < filters.fromDate) return false;
          if (filters.toDate && s.createdAt > filters.toDate) return false;
          return true;
        }),
        R.sortBy([(s) => s.createdAt, 'desc']),
      );

      const limit = filters.limit ?? 20;
      const page = filters.page ?? 1;
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);

      return { items, total: filtered.length, page, limit };
    },
    deleteSavedScreeningSearch: async ({ id }) => {
      savedScreeningSearches.delete(id);
    },
  });
}
