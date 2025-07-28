import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type AppConfig, adaptAppConfig } from '@app-builder/models/app-config';
import { getServerEnv } from '@app-builder/utils/environment';
import { type AppConfigRepository } from './AppConfigRepository';

// Server-side cache for app config with much longer TTL since it's very static
let appConfigCache: {
  data: AppConfig;
  expiresAt: number;
} | null = null;

const APP_CONFIG_CACHE_TTL = 1000 * 60 * 60; // 1 hour cache (only changes on releases)

export function makeServerCachedAppConfigRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): AppConfigRepository => ({
    async getAppConfig(): Promise<AppConfig> {
      const now = Date.now();

      // Return cached data if still valid
      if (appConfigCache && now < appConfigCache.expiresAt) {
        return appConfigCache.data;
      }

      // Fetch fresh data
      const appVersion = getServerEnv('APP_VERSION') ?? 'dev';
      const firebaseOptions = getServerEnv('FIREBASE_CONFIG');
      const freshData = adaptAppConfig(
        await marbleCoreApiClient.getAppConfig(),
        appVersion,
        firebaseOptions,
      );

      // Update cache
      appConfigCache = {
        data: freshData,
        expiresAt: now + APP_CONFIG_CACHE_TTL,
      };

      return freshData;
    },
  });
}

// Function to clear the cache (useful for testing or manual cache invalidation)
export function clearAppConfigCache(): void {
  appConfigCache = null;
}
