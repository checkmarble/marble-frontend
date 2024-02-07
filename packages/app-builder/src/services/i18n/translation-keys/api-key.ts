import { type ApiKey } from '@app-builder/models/api-keys';

export function tKeyForApiKeyRole(role: ApiKey['role']) {
  switch (role) {
    case 'API_CLIENT':
      return 'settings:api_keys.role.api_client';
    default:
      return 'settings:api_keys.role.unknown';
  }
}
