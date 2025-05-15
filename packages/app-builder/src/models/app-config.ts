import { type FirebaseOptions } from 'firebase/app';
import { type AppConfigDto } from 'marble-api';

export type AppConfig = {
  versions: {
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
      projectId?: string;
      apiKey?: string;
      authDomain?: string;
    } & (
      | {
          isEmulator: true;
          emulatorUrl: string;
        }
      | {
          isEmulator: false;
          emulatorUrl?: null;
        }
    );
  };
  features: {
    sso: boolean;
    segment: boolean;
  };
};

export function adaptAppConfig(
  dto: AppConfigDto,
  appVersion: string,
  firebaseOptions: FirebaseOptions,
): AppConfig {
  const fbConfig = dto.auth.firebase;
  const emulatorUrl = fbConfig.emulator_host ? `http://${fbConfig.emulator_host}` : undefined;

  return {
    versions: {
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
        emulatorUrl,
        projectId: firebaseOptions.projectId ?? dto.auth.firebase.project_id,
        apiKey: firebaseOptions.apiKey ?? dto.auth.firebase.api_key,
        authDomain:
          firebaseOptions.authDomain ??
          dto.auth.firebase.auth_domain ??
          dto.auth.firebase.emulator_host,
      } as AppConfig['auth']['firebase'],
    },
    features: {
      sso: dto.features.sso,
      segment: dto.features.segment,
    },
  };
}
