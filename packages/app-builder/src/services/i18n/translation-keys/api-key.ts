import { type ApiKey } from '@app-builder/models/api-keys';

export function tKeyForApiKeyRole(role: ApiKey['role']) {
  switch (role) {
    case 'API_CLIENT':
      return 'settings:api_keys.role.api_client';
    case 'OIDC_CONFIG_EDITOR':
      return 'settings:api_keys.role.oidc_config_editor';
    default:
      return 'settings:api_keys.role.unknown';
  }
}
