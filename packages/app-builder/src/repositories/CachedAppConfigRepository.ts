import type { AppConfig } from '@app-builder/models/app-config';
import { requestCache } from '@app-builder/utils/request-cache';
import type { AppConfigRepository } from './AppConfigRepository';

export function createCachedAppConfigRepository(
  repository: AppConfigRepository,
): AppConfigRepository {
  return {
    ...repository,
    getAppConfig: async (): Promise<AppConfig> => {
      return requestCache.get(
        'getAppConfig',
        () => repository.getAppConfig(),
        30000, // Cache for 30 seconds since app config changes infrequently
      );
    },
  };
}
