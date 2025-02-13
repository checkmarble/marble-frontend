import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adapatSanctionCheckFile,
  adapatSanctionCheckMatchPayload,
  adaptSanctionCheck,
  adaptSanctionCheckMatch,
  type SanctionCheck,
  type SanctionCheckEntitySchema,
  type SanctionCheckFile,
  type SanctionCheckMatch,
  type SanctionCheckMatchPayload,
  type SanctionCheckMatchStatus,
} from '@app-builder/models/sanction-check';
import {
  adaptOpenSanctionsCatalog,
  type OpenSanctionsCatalog,
} from '@app-builder/models/sanction-check-dataset';
import * as R from 'remeda';

export interface SanctionCheckRepository {
  listSanctionChecks(args: { decisionId: string }): Promise<SanctionCheck[]>;
  listDatasets(): Promise<OpenSanctionsCatalog>;
  updateMatchStatus(args: {
    matchId: string;
    status: Extract<SanctionCheckMatchStatus, 'no_hit' | 'confirmed_hit'>;
    comment?: string;
    whitelist?: boolean;
  }): Promise<SanctionCheckMatch>;
  searchSanctionCheckMatches(args: {
    decisionId: string;
    entityType: SanctionCheckEntitySchema;
    fields: Record<string, string>;
  }): Promise<SanctionCheckMatchPayload[]>;
  refineSanctionCheck(args: {
    decisionId: string;
    entityType: SanctionCheckEntitySchema;
    fields: Record<string, string>;
  }): Promise<SanctionCheck>;
  listSanctionCheckFiles(args: {
    sanctionCheckId: string;
  }): Promise<SanctionCheckFile[]>;
}

export function makeGetSanctionCheckRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): SanctionCheckRepository => ({
    listDatasets: async () => {
      return adaptOpenSanctionsCatalog(
        await marbleCoreApiClient.listOpenSanctionDatasets(),
      );
    },
    listSanctionChecks: async ({ decisionId }) => {
      return R.map(
        await marbleCoreApiClient.listSanctionChecks(decisionId),
        adaptSanctionCheck,
      );
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
    searchSanctionCheckMatches: async ({ decisionId, entityType, fields }) => {
      const dto = {
        decision_id: decisionId,
        query: {
          [entityType]: fields,
        },
      };
      return R.map(
        await marbleCoreApiClient.searchSanctionCheckMatches(dto),
        adapatSanctionCheckMatchPayload,
      );
    },
    refineSanctionCheck: async ({ decisionId, entityType, fields }) => {
      const dto = {
        decision_id: decisionId,
        query: {
          [entityType]: fields,
        },
      };
      return adaptSanctionCheck(
        await marbleCoreApiClient.refineSanctionCheck(dto),
      );
    },
    listSanctionCheckFiles: async ({ sanctionCheckId }) => {
      return R.map(
        await marbleCoreApiClient.listSanctionCheckFiles(sanctionCheckId),
        adapatSanctionCheckFile,
      );
    },
  });
}
