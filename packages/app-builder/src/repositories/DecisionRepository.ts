import { type MarbleApi } from '@app-builder/infra/marble-api';
import { type Decision, type Outcome } from 'marble-api';

export interface DecisionRepository {
  listDecisions(args: {
    outcome?: Outcome[];
    triggerObject?: string[];
    dateRange?: {
      startDate?: string;
      endDate?: string;
    };
    scenarioId?: string[];
  }): Promise<Decision[]>;
}

export function getDecisionRepository() {
  return (marbleApiClient: MarbleApi): DecisionRepository => ({
    listDecisions: async ({ dateRange, ...rest }) => {
      return marbleApiClient.listDecisions({
        ...rest,
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
      });
    },
  });
}
