import { PERMISSIONS } from '@marble/shared';

// These permissions apply beyond an organization and cannot be granted to custom roles.
const platformPermissions = new Set<string>([
  'ANY_ORGANIZATION_ID_IN_CONTEXT',
  'ORGANIZATIONS_LIST',
  'ORGANIZATIONS_CREATE',
  'ORGANIZATIONS_DELETE',
  'LICENSE_LIST',
  'LICENSE_CREATE',
  'LICENSE_UPDATE',
  'TENANTS_MERGE',
  'TENANTS_LIST',
  'TENANTS_UPDATE',
]);

export const CUSTOM_ROLE_PERMISSIONS = PERMISSIONS.filter((permission) => !platformPermissions.has(permission));

export function isCustomRolePermission(permission: string): boolean {
  return !platformPermissions.has(permission);
}
