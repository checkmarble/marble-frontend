import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type AppConfig, adaptAppConfig } from '@app-builder/models/app-config';
import { getServerEnv } from '@app-builder/utils/environment';

export interface AppConfigRepository {
  getAppConfig(): Promise<AppConfig>;
}

export function makeGetAppConfigRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): AppConfigRepository => ({
    async getAppConfig() {
      const appVersion = getServerEnv('APP_VERSION') ?? 'dev';
      const firebaseConfig = getServerEnv('FIREBASE_CONFIG');
      return adaptAppConfig(await marbleCoreApiClient.getAppConfig(), appVersion, firebaseConfig);
    },
  });
}
