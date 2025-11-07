import { DecisionOutcomesPerPeriod } from '@app-builder/models/analytics';
import { createAnalyticsQuery } from './factory/create-analytics-query';

export const useGetDecisionsOutcomesPerDay =
  createAnalyticsQuery<DecisionOutcomesPerPeriod>('decision-outcomes-per-day');
