import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptRuleSnoozeWithRuleId,
  type RuleSnoozeWithRuleId,
} from '@app-builder/models/rule-snooze';

export interface RuleSnoozeRepository {
  getRuleSnooze(ruleSnoozeId: string): Promise<RuleSnoozeWithRuleId>;
}

export function makeGetRuleSnoozeRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): RuleSnoozeRepository => ({
    getRuleSnooze: async (ruleSnoozeId) => {
      const { snooze } = await marbleCoreApiClient.getRuleSnooze(ruleSnoozeId);

      // TODO: remove this when the new API is fixed
      return adaptRuleSnoozeWithRuleId({
        rule_id: '13617a88-6cda-4648-805e-b468ae4812f8',
        ...snooze,
      });
    },
  });
}
