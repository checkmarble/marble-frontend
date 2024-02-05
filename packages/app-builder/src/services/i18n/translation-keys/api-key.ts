import { type ApiKey } from '@app-builder/models/api-keys';

export function tKeyForApiKeyRole(role: ApiKey['role']) {
  switch (role) {
    case 'ADMIN':
      return 'settings:api_keys.role.admin';
    case 'PUBLISHER':
      return 'settings:api_keys.role.publisher';
    case 'BUILDER':
      return 'settings:api_keys.role.builder';
    case 'VIEWER':
      return 'settings:api_keys.role.viewer';
    case 'API_CLIENT':
      return 'settings:api_keys.role.api_client';
    default:
      return 'settings:api_keys.role.unknown';
  }
}
