import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptRuleSnooze,
  type RuleSnooze,
} from '@app-builder/models/rule-snooze';

export interface RuleSnoozeRepository {
  getRuleSnooze(ruleSnoozeId: string): Promise<RuleSnooze>;
}

export function makeGetRuleSnoozeRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): RuleSnoozeRepository => ({
    getRuleSnooze: async (ruleSnoozeId) => {
      const { snooze } = await marbleCoreApiClient.getRuleSnooze(ruleSnoozeId);

      return adaptRuleSnooze(snooze);
    },
  });
}
