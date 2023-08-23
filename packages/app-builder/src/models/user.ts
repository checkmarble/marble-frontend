import { type CredentialsDto } from '@marble-api';
import * as R from 'remeda';

export interface User {
  organizationId: string;
  role: string;
  actorIdentity: {
    userId?: string;
    email?: string;
  };
  permissions: UserPermissions;
}

function NewPermissionsList() {
  return {
    canManageList: 'CUSTOM_LISTS_PUBLISH',
    canManageListItem: 'CUSTOM_LISTS_PUBLISH',
    canManageScenario: 'SCENARIO_CREATE',
    canPublishScenario: 'SCENARIO_PUBLISH',
  } as const;
}

export type UserPermissions = Record<
  keyof ReturnType<typeof NewPermissionsList>,
  boolean
>;

export function NewPermissions(): UserPermissions {
  return R.mapValues(NewPermissionsList(), () => false);
}

export function adaptUser(credentials: CredentialsDto['credentials']): User {
  console.log(credentials.permissions);
  return {
    organizationId: credentials.organization_id,
    role: credentials.role,
    actorIdentity: {
      userId: credentials.actor_identity.user_id,
      email: credentials.actor_identity.email,
    },
    permissions: R.pipe(
      NewPermissionsList(),
      R.mapValues((permissionList) =>
        credentials.permissions.includes(permissionList)
      )
    ),
  };
}
