import { type AppConfigDto } from 'marble-api';

export type AppConfig = {
  version: {
    apiVersion: string;
    appVersion: string;
  };
  status: {
    migrations: boolean;
    hasOrg: boolean;
    hasUser: boolean;
  };
  urls: {
    marble: string | null;
    metabase: string | null;
  };
  auth: {
    firebase: {
      isEmulator: boolean;
      emulatorUrl: string;
      projectId: string;
      apiKey: string;
      authDomain: string;
    };
  };
  features: {
    sso: boolean;
    segment: boolean;
  };
};

export function adaptAppConfig(dto: AppConfigDto, appVersion: string): AppConfig {
  return {
    version: {
      apiVersion: dto.version,
      appVersion,
    },
    status: {
      migrations: dto.status.migrations,
      hasOrg: dto.status.has_org,
      hasUser: dto.status.has_user,
    },
    urls: {
      marble: dto.urls.marble,
      metabase: dto.urls.metabase,
    },
    auth: {
      firebase: {
        isEmulator: dto.auth.firebase.is_emulator,
        emulatorUrl: dto.auth.firebase.emulator_url,
        projectId: dto.auth.firebase.project_id,
        apiKey: dto.auth.firebase.api_key,
        authDomain: dto.auth.firebase.auth_domain,
      },
    },
    features: {
      sso: dto.features.sso,
      segment: dto.features.segment,
    },
  };
}
