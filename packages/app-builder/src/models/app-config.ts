import { getServerEnv } from '@app-builder/utils/environment';
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
    marble: string;
    metabase: string | null;
  };
  auth: {
    provider: string;
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
    oidc: {
      issuer: string;
      client_id: string;
      redirect_uri: string;
      scopes: string[];
      extra_params: { [key: string]: string };
    };
  };
  features: {
    sso: boolean;
    segment: boolean;
  };
  isManagedMarble: boolean;
};

export function adaptAppConfig(dto: AppConfigDto, appVersion: string): AppConfig {
  const fbConfig = dto.auth.firebase;
  const emulatorHost = getServerEnv('TEST_FIREBASE_AUTH_EMULATOR_HOST');
  const emulatorUrl = fbConfig.emulator_host
    ? `http://${emulatorHost ?? fbConfig.emulator_host}`
    : undefined;

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
      provider: dto.auth.provider,
      firebase: {
        isEmulator: dto.auth.firebase.is_emulator,
        emulatorUrl,
        projectId: dto.auth.firebase.project_id,
        apiKey: dto.auth.firebase.api_key,
        authDomain: dto.auth.firebase.auth_domain ?? dto.auth.firebase.emulator_host,
      } as AppConfig['auth']['firebase'],
      oidc: {
        issuer: dto.auth.oidc?.issuer ?? '',
        client_id: dto.auth.oidc?.client_id ?? '',
        redirect_uri: dto.auth.oidc?.redirect_uri ?? '',
        scopes: dto.auth.oidc?.scopes ?? ['openid', 'email', 'profile', 'offline_access'],
        extra_params: dto.auth.oidc?.extra_params ?? {},
      },
    },
    features: {
      sso: dto.features.sso,
      segment: dto.features.segment,
    },
    isManagedMarble: process.env['NODE_ENV'] === 'development' ? true : dto.is_managed_marble,
  };
}
