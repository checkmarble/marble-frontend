import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import {
  type AvailableFeatures,
  adaptScreening,
  adaptScreeningFile,
  adaptScreeningMatch,
  adaptScreeningMatchPayload,
  type OpenSanctionEntitySchema,
  type SavedScreeningSearchFilters,
  SavedScreeningSearchPage,
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
  }): Promise<{ id: string; matches: ScreeningMatchPayload[] }>;
  saveFreeformSearch(args: { id: string }): Promise<void>;
  getAiSuggestions(args: { screeningId: string }): Promise<ScreeningAiSuggestion[]>;
  enrichedData(args: { entityId: string }): Promise<ScreeningMatchPayload>;
  getAvailableFilters(args: { feature: AvailableFeatures }): Promise<ScreeningAvailableFiltersAdapted>;
  listSavedScreeningSearches(filters: SavedScreeningSearchFilters): Promise<SavedScreeningSearchPage>;
  getFreeformSearch(args: { id: string }): Promise<{ id: string; matches: ScreeningMatchPayload[] }>;
}

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
      const { id, matches } = await marbleCoreApiClient.freeformSearch(dto, { limit });
      return {
        id,
        matches: R.map(matches, (match) => adaptScreeningMatchPayload(match)),
      };
    },
    saveFreeformSearch: async ({ id }) => {
      await marbleCoreApiClient.saveFreeformSearch(id);
    },
    getAiSuggestions: async ({ screeningId }) => {
      return R.map(await marbleCoreApiClient.getScreeningAiSuggestions(screeningId), adaptScreeningAiSuggestion);
    },
    listSavedScreeningSearches: async ({ isSaved, userId, apiKeyId, offsetId, limit, createdAfter, createdBefore }) => {
      return await marbleCoreApiClient.listFreeformSearches({
        savedOnly: isSaved,
        userId,
        apiKeyId,
        offsetId,
        limit,
        createdAfter,
        createdBefore,
      });
    },
    getFreeformSearch: async ({ id }) => {
      const res = await marbleCoreApiClient.getFreeformSearch(id);
      return {
        id: res.id,
        matches: res.matches ? R.map(res.matches, (match) => adaptScreeningMatchPayload(match)) : [],
      };
    },
  });
}
