import { createMarbleApi, type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type AppConfig, adaptAppConfig } from '@app-builder/models/app-config';
import { adaptReleaseNotes, type ReleaseNotes } from '@app-builder/models/release-notes';
import { getServerEnv } from '@app-builder/utils/environment';

type AppConfigDto = Awaited<ReturnType<MarbleCoreApi['getAppConfig']>>;

const appVersion = () => getServerEnv('APP_VERSION') ?? 'dev';

// SSR runs every loader's server fn with the same document Request, so a page fetches the config once.
const appConfigDtoByRequest = new WeakMap<Request, Promise<AppConfigDto>>();

function getAppConfigDto(request: Request): Promise<AppConfigDto> {
  let dto = appConfigDtoByRequest.get(request);
  if (!dto) {
    dto = createMarbleApi(request).getAppConfig();
    appConfigDtoByRequest.set(request, dto);
  }
  return dto;
}

export async function getAppConfig(request: Request): Promise<AppConfig> {
  return adaptAppConfig(await getAppConfigDto(request), appVersion());
}

export async function getReleaseNotes(request: Request): Promise<ReleaseNotes> {
  return adaptReleaseNotes(await getAppConfigDto(request), appVersion());
}

/** Bypasses the per-request cache, to read the config back after changing it. */
export async function fetchAppConfig(api: MarbleCoreApi): Promise<AppConfig> {
  return adaptAppConfig(await api.getAppConfig(), appVersion());
}
