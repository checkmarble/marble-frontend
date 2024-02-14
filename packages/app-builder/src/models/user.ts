import { type CredentialsDto, type UserDto } from 'marble-api';
import * as R from 'remeda';

export interface CurrentUser {
  organizationId: string;
  role: string;
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
    canManageList: 'CUSTOM_LISTS_PUBLISH',
    canManageListItem: 'CUSTOM_LISTS_PUBLISH',
    canManageScenario: 'SCENARIO_CREATE',
    canPublishScenario: 'SCENARIO_PUBLISH',
    canIngestData: 'INGESTION',
    canEditDataModel: 'DATA_MODEL_WRITE',
    canManageDecision: 'DECISION_CREATE',
    canEditInboxes: 'INBOX_EDITOR',
    canReadAnalytics: 'ANALYTICS_READ',
  } as const;
}

export type UserPermissions = Record<
  keyof ReturnType<typeof NewPermissionsList>,
  boolean
>;

export function NewPermissions(): UserPermissions {
  return R.mapValues(NewPermissionsList(), () => false);
}

export function adaptCurrentUser(
  credentials: CredentialsDto['credentials'],
): CurrentUser {
  return {
    organizationId: credentials.organization_id,
    role: credentials.role,
    actorIdentity: {
      userId: credentials.actor_identity.user_id,
      email: credentials.actor_identity.email,
      firstName: credentials.actor_identity.first_name,
      lastName: credentials.actor_identity.last_name,
    },
    permissions: R.pipe(
      NewPermissionsList(),
      R.mapValues((permissionList) =>
        credentials.permissions.includes(permissionList),
      ),
    ),
  };
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}

export function adaptUser(user: UserDto): User {
  return {
    userId: user.user_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    organizationId: user.organization_id,
  };
}

export const isAdmin = (user: CurrentUser) => user.role === 'ADMIN';
