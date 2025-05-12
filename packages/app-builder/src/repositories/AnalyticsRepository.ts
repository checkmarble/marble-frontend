import type { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type Analytics, adaptAnalytics } from '@app-builder/models/analytics';

export interface AnalyticsRepository {
  listAnalytics(): Promise<Analytics[]>;
}

export function makeGetAnalyticsRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): AnalyticsRepository => ({
    listAnalytics: async () => {
      const { analytics } = await marbleCoreApiClient.listAnalytics();

      return analytics.map(adaptAnalytics);
    },
  });
}
