import { FirebaseConfig } from '@app-builder/utils/environment';
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
  isManagedMarble: boolean;
  isProduction: boolean;
};

export function adaptAppConfig(
  dto: AppConfigDto,
  appVersion: string,
  environment: string,
  firebaseConfig: FirebaseConfig,
): AppConfig {
  const fbConfig = dto.auth.firebase;
  const emulatorUrl =
    firebaseConfig.emulatorHost || fbConfig.emulator_host
      ? `http://${firebaseConfig.emulatorHost || fbConfig.emulator_host}`
      : undefined;
  const firebaseOptions = firebaseConfig.options;

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
    isManagedMarble: dto.is_managed_marble,
    isProduction: environment === 'production',
  };
}
