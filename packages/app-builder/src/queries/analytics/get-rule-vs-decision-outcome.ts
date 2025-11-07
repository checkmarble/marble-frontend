import { RuleVsDecisionOutcome } from '@app-builder/models/analytics';
import { createAnalyticsQuery } from './factory/create-analytics-query';

export const useGetRuleVsDecisionOutcome = createAnalyticsQuery<RuleVsDecisionOutcome[]>('rule-vs-decision-outcome');
