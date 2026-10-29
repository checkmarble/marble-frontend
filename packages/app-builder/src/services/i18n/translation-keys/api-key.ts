export function tKeyForApiKeyRole(role: string) {
  switch (role) {
    case 'API_CLIENT':
      return 'settings:api_keys.role.api_client';
    default:
      return 'settings:api_keys.role.unknown';
  }
}
