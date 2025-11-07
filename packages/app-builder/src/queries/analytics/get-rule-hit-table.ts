import { RuleHitTableResponse } from '@app-builder/models/analytics/rule-hit';
import { createAnalyticsQuery } from './factory/create-analytics-query';

export const useGetRuleHitTable = createAnalyticsQuery<RuleHitTableResponse[]>('rule-hit-table');
