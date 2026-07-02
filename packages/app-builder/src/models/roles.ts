import { type RoleAndPermissions, type Role as RoleDto } from 'marble-api';

export interface CustomRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface RolesAndPermissions {
  roles: CustomRole[];
  availablePermissions: string[];
}

export function adaptCustomRole(dto: RoleDto): CustomRole {
  return {
    id: dto.id,
    name: dto.name,
    permissions: dto.permissions.map((permission) => permission.name),
  };
}

export function adaptRolesAndPermissions(dto: RoleAndPermissions): RolesAndPermissions {
  return {
    roles: dto.roles.map(adaptCustomRole),
    availablePermissions: dto.permissions,
  };
}

/**
 * Catalog of permissions grouped by functional domain, used to render the role
 * permission editor in a structured way. Groups and their order are curated; any
 * permission returned by the backend that is not listed here falls into the
 * `other` group so nothing is ever hidden from the editor.
 */
export const permissionGroups = [
  {
    key: 'decisions',
    permissions: ['DECISION_READ', 'DECISION_CREATE', 'PHANTOM_DECISION_CREATE', 'INGESTION'],
  },
  {
    key: 'scenarios',
    permissions: [
      'SCENARIO_READ',
      'SCENARIO_CREATE',
      'SCENARIO_PUBLISH',
      'SCORING_UPDATE_SETTINGS',
      'SCORING_UPDATE_RULESETS',
      'SCORING_OVERRIDE_SCORE',
    ],
  },
  {
    key: 'data_model',
    permissions: ['DATA_MODEL_READ', 'DATA_MODEL_WRITE', 'CUSTOM_LISTS_READ', 'CUSTOM_LISTS_EDIT'],
  },
  {
    key: 'cases',
    permissions: [
      'CASE_READ_WRITE',
      'INBOX_EDITOR',
      'READ_SNOOZES',
      'CREATE_SNOOZE',
      'ANNOTATION_DELETE',
      'ANNOTATION_RISK_TAG_WRITE',
      'TAG_READ',
      'TAG_CREATE',
      'TAG_UPDATE',
      'TAG_DELETE',
    ],
  },
  {
    key: 'screening',
    permissions: [
      'SCREENING_WHITELIST_READ',
      'SCREENING_WHITELIST_WRITE',
      'SCREENING_FREEFORM_SEARCH',
      'CONTINUOUS_SCREENING_CONFIG_READ',
      'CONTINUOUS_SCREENING_CONFIG_WRITE',
      'CONTINUOUS_SCREENING_HIT_READ',
      'CONTINUOUS_SCREENING_HIT_WRITE',
      'CONTINUOUS_SCREENING_HIT_DISMISS',
      'CONTINUOUS_SCREENING_OBJECT_READ',
      'CONTINUOUS_SCREENING_OBJECT_WRITE',
    ],
  },
  {
    key: 'users',
    permissions: [
      'USER_CREATE',
      'MARBLE_USER_READ',
      'MARBLE_USER_LIST',
      'MARBLE_USER_CREATE',
      'MARBLE_USER_UPDATE',
      'MARBLE_USER_DELETE',
      'MANAGE_ROLES',
    ],
  },
  {
    key: 'api',
    permissions: ['APIKEY_READ', 'APIKEY_CREATE', 'WEBHOOK', 'WEBHOOK_EVENT', 'ANALYTICS_READ'],
  },
  {
    key: 'organization',
    permissions: [
      'ORGANIZATIONS_LIST',
      'ORGANIZATIONS_CREATE',
      'ORGANIZATIONS_UPDATE',
      'ORGANIZATIONS_DELETE',
      'ANY_ORGANIZATION_ID_IN_CONTEXT',
      'ORG_IMPORT_ARCHETYPE_READ',
      'ORG_IMPORT_INTO_EXISTING',
      'ORG_EXPORT',
      'LICENSE_LIST',
      'LICENSE_CREATE',
      'LICENSE_UPDATE',
    ],
  },
] as const;

export type PermissionGroupKey = (typeof permissionGroups)[number]['key'] | 'other';

/**
 * Splits the backend-provided permission list into curated groups (in catalog order),
 * appending any uncatalogued permissions to an `other` group so all permissions render.
 */
export function groupPermissions(
  availablePermissions: string[],
): Array<{ key: PermissionGroupKey; permissions: string[] }> {
  const available = new Set(availablePermissions);
  const grouped: Array<{ key: PermissionGroupKey; permissions: string[] }> = [];
  const seen = new Set<string>();

  for (const group of permissionGroups) {
    const permissions = group.permissions.filter((permission) => available.has(permission));
    permissions.forEach((permission) => seen.add(permission));
    if (permissions.length > 0) grouped.push({ key: group.key, permissions });
  }

  const other = availablePermissions.filter((permission) => !seen.has(permission));
  if (other.length > 0) grouped.push({ key: 'other', permissions: other });

  return grouped;
}
