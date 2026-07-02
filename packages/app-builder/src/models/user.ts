import { type ParseKeys } from 'i18next';
import { type CredentialsDto, type UserDto } from 'marble-api';
import * as R from 'remeda';

export interface CurrentUser {
  organizationId: string;
  roles: string[];
  actorIdentity: {
    userId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  permissions: UserPermissions;
}

function NewPermissionsList() {
  return {
    canManageList: 'CUSTOM_LISTS_EDIT',
    canManageListItem: 'CUSTOM_LISTS_EDIT',
    canManageScenario: 'SCENARIO_CREATE',
    canPublishScenario: 'SCENARIO_PUBLISH',
    canIngestData: 'INGESTION',
    canEditDataModel: 'DATA_MODEL_WRITE',
    canManageDecision: 'DECISION_CREATE',
    canEditInboxes: 'INBOX_EDITOR',
    canReadAnalytics: 'ANALYTICS_READ',
    canManageWebhooks: 'WEBHOOK',
    canCreateUser: 'MARBLE_USER_CREATE',
    canDeleteUser: 'MARBLE_USER_DELETE',
    canReadApiKey: 'APIKEY_READ',
    canCreateApiKey: 'APIKEY_CREATE',
    canReadSnoozes: 'READ_SNOOZES',
    canCreateSnoozes: 'CREATE_SNOOZE',
    canManageRoles: 'MANAGE_ROLES',
    canReadUser: 'MARBLE_USER_LIST',
    canReadTags: 'TAG_READ',
    canReadDecisions: 'DECISION_READ',
    canReadScenarios: 'SCENARIO_READ',
    canReadDataModel: 'DATA_MODEL_READ',
    canUpdateOrganization: 'ORGANIZATIONS_UPDATE',
    canManageScoring: 'SCORING_UPDATE_SETTINGS',
    canReadContinuousScreening: 'CONTINUOUS_SCREENING_CONFIG_READ',
  } as const;
}

export type UserPermissions = Record<keyof ReturnType<typeof NewPermissionsList>, boolean>;

export function NewPermissions(): UserPermissions {
  return R.mapValues(NewPermissionsList(), () => false);
}

export function adaptCurrentUser(credentials: CredentialsDto['credentials']): CurrentUser {
  return {
    organizationId: credentials.organization_id,
    roles: credentials.roles,
    actorIdentity: {
      userId: credentials.actor_identity.user_id,
      email: credentials.actor_identity.email,
      firstName: credentials.actor_identity.first_name,
      lastName: credentials.actor_identity.last_name,
    },
    permissions: R.pipe(
      NewPermissionsList(),
      R.mapValues((permissionList) => credentials.permissions.includes(permissionList)),
    ),
  };
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId: string;
}

export function adaptUser(user: UserDto): User {
  return {
    userId: user.user_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    roles: user.roles,
    organizationId: user.organization_id,
  };
}

export const isAdmin = (user: CurrentUser) => user.roles.includes('ADMIN');

export const isMarbleAdmin = (user: CurrentUser) => user.roles.includes('MARBLE_ADMIN');

export const isAnalyst = (user: CurrentUser) => user.roles.includes('ANALYST');

// Custom, organization-defined roles are returned by the backend with an `org/` prefix.
export const CUSTOM_ROLE_PREFIX = 'org/';

export const isCustomUserRole = (role: string) => role.startsWith(CUSTOM_ROLE_PREFIX);

export const getCustomUserRoleName = (role: string) => role.slice(CUSTOM_ROLE_PREFIX.length);

// Standard roles that have a curated translation. Any other role returned by the backend
// (e.g. new/custom roles) is displayed by its own identifier rather than a generic "unknown" label.
export const knownUserRoles = ['ADMIN', 'PUBLISHER', 'BUILDER', 'VIEWER', 'ANALYST'] as const;

export const isKnownUserRole = (role: string) => (knownUserRoles as readonly string[]).includes(role);

export function tKeyForUserRole(role: string): ParseKeys<['settings']> {
  switch (role) {
    case 'ADMIN':
      return 'settings:users.role.admin';
    case 'PUBLISHER':
      return 'settings:users.role.publisher';
    case 'BUILDER':
      return 'settings:users.role.builder';
    case 'VIEWER':
      return 'settings:users.role.viewer';
    case 'ANALYST':
      return 'settings:users.role.analyst';
    default:
      return 'settings:users.role.unknown';
  }
}
