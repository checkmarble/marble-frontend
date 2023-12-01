import { type MarbleApi } from '@app-builder/infra/marble-api';
import { add } from 'date-fns';
import {
  type Case,
  type CaseDetail,
  type CaseStatus,
  type UpdateCaseBody,
} from 'marble-api';
import { Temporal } from 'temporal-polyfill';

export interface CaseRepository {
  listCases(args: {
    statuses?: CaseStatus[];
    dateRange?:
      | {
          type: 'static';
          startDate?: string;
          endDate?: string;
        }
      | {
          type: 'dynamic';
          fromNow: string;
        };
    inboxId?: string[];
  }): Promise<Case[]>;
  getCase(args: { caseId: string }): Promise<CaseDetail>;
  updateCase(args: {
    caseId: string;
    body: UpdateCaseBody;
  }): Promise<CaseDetail>;
}

export function getCaseRepository() {
  return (marbleApiClient: MarbleApi): CaseRepository => ({
    listCases: async ({ dateRange, inboxId, ...rest }) => {
      let startDate, endDate: string | undefined;
      if (dateRange?.type === 'static') {
        startDate = dateRange?.startDate;
        endDate = dateRange?.endDate;
      }
      if (dateRange?.type === 'dynamic') {
        const fromNowDuration = Temporal.Duration.from(dateRange?.fromNow);
        //TODO(timezone): until we get user TZ, timezone is the server one here (should not be a real issue regarding the use case)
        startDate = add(new Date(), fromNowDuration).toISOString();
      }

      return marbleApiClient.listCases({
        ...rest,
        inboxId,
        startDate,
        endDate,
      });
    },
    getCase: async ({ caseId }) => {
      return marbleApiClient.getCase(caseId);
    },
    updateCase: async ({ caseId, body }) => {
      const result = await marbleApiClient.updateCase(caseId, body);
      return result.case;
    },
  });
}
