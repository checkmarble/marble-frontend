import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { isNotFoundHttpError } from '@app-builder/models/http-errors';
import {
  adaptScreening,
  adaptScreeningFile,
  adaptScreeningMatch,
  adaptScreeningMatchPayload,
  type OpenSanctionEntitySchema,
  type Screening,
  type ScreeningFile,
  type ScreeningMatch,
  type ScreeningMatchPayload,
  type ScreeningMatchStatus,
} from '@app-builder/models/screening';
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
}

export function makeGetScreeningRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): ScreeningRepository => ({
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
  });
}
