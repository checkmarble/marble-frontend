import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adapatSanctionCheckFile,
  adapatSanctionCheckMatchPayload,
  adaptSanctionCheck,
  adaptSanctionCheckMatch,
  type OpenSanctionEntitySchema,
  type SanctionCheck,
  type SanctionCheckFile,
  type SanctionCheckMatch,
  type SanctionCheckMatchPayload,
  type SanctionCheckMatchStatus,
} from '@app-builder/models/sanction-check';
import {
  adaptOpenSanctionsDatasetFreshness,
  type OpenSanctionsDatasetFreshness,
} from '@app-builder/models/sanction-check-dataset';
import { type OpenSanctionsCatalogDto } from 'marble-api';
import * as R from 'remeda';

export interface SanctionCheckRepository {
  listSanctionChecks(args: { decisionId: string }): Promise<SanctionCheck[]>;
  listDatasets(): Promise<OpenSanctionsCatalogDto>;
  getDatasetFreshness(): Promise<OpenSanctionsDatasetFreshness>;
  updateMatchStatus(args: {
    matchId: string;
    status: Extract<SanctionCheckMatchStatus, 'no_hit' | 'confirmed_hit'>;
    comment?: string;
    whitelist?: boolean;
  }): Promise<SanctionCheckMatch>;
  searchSanctionCheckMatches(args: {
    sanctionCheckId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  }): Promise<SanctionCheckMatchPayload[]>;
  refineSanctionCheck(args: {
    sanctionCheckId: string;
    entityType: OpenSanctionEntitySchema;
    fields: Record<string, string>;
  }): Promise<SanctionCheck>;
  listSanctionCheckFiles(args: { sanctionCheckId: string }): Promise<SanctionCheckFile[]>;
  enrichMatch(args: { matchId: string }): Promise<SanctionCheckMatch>;
}

export function makeGetSanctionCheckRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): SanctionCheckRepository => ({
    listDatasets: marbleCoreApiClient.listOpenSanctionDatasets,
    getDatasetFreshness: async () => {
      return adaptOpenSanctionsDatasetFreshness(await marbleCoreApiClient.getDatasetsFreshness());
    },
    listSanctionChecks: async ({ decisionId }) => {
      return R.map(await marbleCoreApiClient.listSanctionChecks(decisionId), adaptSanctionCheck);
    },
    updateMatchStatus: async ({ matchId, status, comment, whitelist }) => {
      return adaptSanctionCheckMatch(
        await marbleCoreApiClient.updateSanctionCheckMatch(matchId, {
          status,
          comment,
          whitelist,
        }),
      );
    },
    searchSanctionCheckMatches: async ({ sanctionCheckId, entityType, fields }) => {
      const dto = {
        sanction_check_id: sanctionCheckId,
        query: {
          [entityType]: fields,
        },
      };
      return R.map(
        await marbleCoreApiClient.searchSanctionCheckMatches(dto),
        adapatSanctionCheckMatchPayload,
      );
    },
    refineSanctionCheck: async ({ sanctionCheckId, entityType, fields }) => {
      const dto = {
        sanction_check_id: sanctionCheckId,
        query: {
          [entityType]: fields,
        },
      };
      return adaptSanctionCheck(await marbleCoreApiClient.refineSanctionCheck(dto));
    },
    listSanctionCheckFiles: async ({ sanctionCheckId }) => {
      return R.map(
        await marbleCoreApiClient.listSanctionCheckFiles(sanctionCheckId),
        adapatSanctionCheckFile,
      );
    },
    enrichMatch: async ({ matchId }) => {
      return adaptSanctionCheckMatch(await marbleCoreApiClient.enrichSanctionCheckMatch(matchId));
    },
  });
}
