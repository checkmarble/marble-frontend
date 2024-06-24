import { type MarbleApi } from '@app-builder/infra/marble-api';
import { adaptAnalytics, type Analytics } from '@app-builder/models/analytics';

export interface AnalyticsRepository {
  listAnalytics(): Promise<Analytics[]>;
}

export function makeGetAnalyticsRepository() {
  return (marbleApiClient: MarbleApi): AnalyticsRepository => ({
    listAnalytics: async () => {
      const { analytics } = await marbleApiClient.listAnalytics();

      return analytics.map(adaptAnalytics);
    },
  });
}
