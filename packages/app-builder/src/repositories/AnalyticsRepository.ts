import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { legacyAnalytics } from '@app-builder/models/analytics';

export interface AnalyticsRepository {
  legacyListAnalytics(): Promise<legacyAnalytics.Analytics[]>;
}

export function makeGetAnalyticsRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): AnalyticsRepository => ({
    legacyListAnalytics: async () => {
      const { analytics } = await marbleCoreApiClient.legacyListAnalytics();

      return analytics.map(legacyAnalytics.adaptAnalytics);
    },
  });
}
