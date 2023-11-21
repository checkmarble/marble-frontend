import { type MarbleApi } from '@app-builder/infra/marble-api';
import { type Case } from 'marble-api';

export interface CaseRepository {
  listCases(): Promise<Case[]>;
  getCase(args: { caseId: string }): Promise<Case>;
}

export function getCaseRepository() {
  return (marbleApiClient: MarbleApi): CaseRepository => ({
    listCases: async () => {
      return marbleApiClient.listCases({});
    },
    getCase: async ({ caseId }) => {
      return marbleApiClient.getCase(caseId);
    },
  });
}
