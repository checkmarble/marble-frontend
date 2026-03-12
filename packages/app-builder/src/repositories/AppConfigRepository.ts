import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type AppConfig, adaptAppConfig } from '@app-builder/models/app-config';
import { adaptReleaseNotes, ReleaseNotes } from '@app-builder/models/release-notes';
import { getServerEnv } from '@app-builder/utils/environment';

export interface AppConfigRepository {
  getAppConfig(): Promise<AppConfig>;
  getReleaseNotes(): Promise<ReleaseNotes>;
}

export function makeGetAppConfigRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): AppConfigRepository => ({
    async getAppConfig() {
      const appVersion = getServerEnv('APP_VERSION') ?? 'dev';
      return adaptAppConfig(await marbleCoreApiClient.getAppConfig(), appVersion);
    },
    async getReleaseNotes() {
      const appVersion = getServerEnv('APP_VERSION') ?? 'dev';
      return adaptReleaseNotes(await marbleCoreApiClient.getAppConfig(), appVersion);
    },
  });
}
