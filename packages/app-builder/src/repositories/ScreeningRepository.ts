import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import {
  adaptScreening,
  adaptScreeningFile,
  adaptScreeningMatch,
  adaptScreeningMatchPayload,
  type OpenSanctionEntitySchema,
  type Screening,
  ScreeningAvailableFiltersAdapted,
  type ScreeningFile,
  type ScreeningMatch,
  type ScreeningMatchPayload,
  type ScreeningMatchStatus,
} from '@app-builder/models/screening';
import { adaptScreeningAiSuggestion, type ScreeningAiSuggestion } from '@app-builder/models/screening-ai-suggestion';
import {
  adaptOpenSanctionsDatasetFreshness,
  type OpenSanctionsDatasetFreshness,
} from '@app-builder/models/screening-dataset';
import { AvailableFeatures } from '@app-builder/server-fns/screenings';
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
}

export function makeGetScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ScreeningRepository => ({
    getAvailableFilters: async ({ feature }) => {
      const listFeature: ScreeningAvailableFiltersAdapted =
        await marbleCoreApiClient.listScreeningAvailableFilters(feature);
      // FOR TESTING
      // listFeature.sections.peps = {
      //   topics: {
      //     kind_of_peps: [{ name: 'primary', title: 'Primary PEP' }],

      //     relevant_continents: [
      //       { name: 'africa', title: 'Africa' },
      //       { name: 'asia', title: 'Asia' },
      //       { name: 'europe', title: 'Europe' },
      //       { name: 'north-aerica', title: 'North America' },
      //       { name: 'south-america', title: 'South America' },
      //       { name: 'oceania', title: 'Oceania' },
      //     ],
      //     relevant_positions: [
      //       { name: 'president', title: 'President' },
      //       { name: 'prime-minister', title: 'Prime Minister' },
      //       { name: 'minister', title: 'Minister' },
      //       { name: 'senator', title: 'Senator' },
      //       { name: 'representative', title: 'Representative' },
      //       { name: 'member-of-parliament', title: 'Member of Parliament' },
      //       { name: 'member-of-legislature', title: 'Member of Legislature' },
      //       { name: 'member-of-congress', title: 'Member of Congress' },
      //       { name: 'member-of-assembly', title: 'Member of Assembly' },
      //       { name: 'member-of-senate', title: 'Member of Senate' },
      //       { name: 'member-of-house', title: 'Member of House' },
      //       { name: 'member-of-board', title: 'Member of Board' },
      //       { name: 'member-of-committee', title: 'Member of Committee' },
      //       { name: 'member-of-commission', title: 'Member of Commission' },
      //       { name: 'member-of-council', title: 'Member of Council' },
      //       { name: 'member-of-governing-body', title: 'Member of Governing Body' },
      //       { name: 'member-of-governing-council', title: 'Member of Governing Council' },
      //       { name: 'member-of-governing-board', title: 'Member of Governing Board' },
      //       { name: 'member-of-governing-committee', title: 'Member of Governing Committee' },
      //       { name: 'member-of-governing-commission', title: 'Member of Governing Commission' },
      //       { name: 'ngo-member', title: 'NGO Member' },
      //       { name: 'ngo-board-member', title: 'NGO Board Member' },
      //       { name: 'ngo-committee-member', title: 'NGO Committee Member' },
      //       { name: 'ngo-commission-member', title: 'NGO Commission Member' },
      //       { name: 'ngo-council-member', title: 'NGO Council Member' },
      //       { name: 'ngo-governing-body-member', title: 'NGO Governing Body Member' },
      //       { name: 'ngo-governing-council-member', title: 'NGO Governing Council Member' },
      //       { name: 'ngo-governing-board-member', title: 'NGO Governing Board Member' },
      //       { name: 'ngo-governing-committee-member', title: 'NGO Governing Committee Member' },
      //       { name: 'ngo-governing-commission-member', title: 'NGO Governing Commission Member' },
      //     ],
      //   },
      // };
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
        datasets,
        threshold,
      };
      const results = await marbleCoreApiClient.freeformSearch(dto, { limit });
      return R.map(results, (result) => adaptScreeningMatchPayload(result.payload));
    },
    getAiSuggestions: async ({ screeningId }) => {
      return R.map(await marbleCoreApiClient.getScreeningAiSuggestions(screeningId), adaptScreeningAiSuggestion);
    },
  });
}
