import { ScreeningHitTableResponse } from '@app-builder/models/analytics';
import { createAnalyticsQuery } from './factory/create-analytics-query';

export const useGetScreeningHitsTable = createAnalyticsQuery<ScreeningHitTableResponse[]>('screening-hits-table');
