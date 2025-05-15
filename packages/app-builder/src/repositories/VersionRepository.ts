import type { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import type { AppVersions } from '@app-builder/models/version';
import { getServerEnv } from '@app-builder/utils/environment';

export interface VersionRepository {
  getBackendVersion(): Promise<AppVersions>;
}

export function makeGetVersionRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): VersionRepository => ({
    async getBackendVersion() {
      const { version: apiVersion } = await marbleCoreApiClient.getBackendVersion();
      return {
        appVersion: getServerEnv('APP_VERSION') ?? 'dev',
        apiVersion,
      };
    },
  });
}
