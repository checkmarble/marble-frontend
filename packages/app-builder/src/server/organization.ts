import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptUser, isNotFoundHttpError, type TenantUser, type User } from '@app-builder/models';
import {
  adaptOrganizationDto,
  adaptUserOrganization,
  type Organization,
  type OrganizationUpdateInput,
  type UserOrganization,
} from '@app-builder/models/organization';
import { type RoleBinding, type Tag, type UserDto } from 'marble-api';

export async function getCurrentOrganization(api: MarbleCoreApi, organizationId: string): Promise<Organization> {
  const { organization } = await api.getOrganization(organizationId);

  return adaptOrganizationDto(organization);
}

export async function listMyOrganizations(api: MarbleCoreApi): Promise<UserOrganization[]> {
  const organizations = await readMyOrganizations(() => api.listMyOrganizations());
  return organizations.map(adaptUserOrganization);
}

export async function listUsers(
  api: MarbleCoreApi,
  organizationId: string,
  args?: { withTfa?: boolean },
): Promise<User[]> {
  const { users } = await api.listUsers({
    organizationId,
    withTfa: args?.withTfa ?? false,
  });
  // Without `tenantAccess`, the endpoint returns plain users
  return (users as UserDto[]).map(adaptUser);
}

export async function listTenantUsersWithoutAccess(api: MarbleCoreApi, organizationId: string): Promise<TenantUser[]> {
  const { users } = await api.listUsers({ organizationId, tenantAccess: 'missing' });
  return users.map((user) => ({
    userId: user.user_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  }));
}

export async function grantAccess(
  api: MarbleCoreApi,
  organizationId: string,
  { tenantId, userId, roles }: { tenantId: string; userId: string; roles: RoleBinding[] },
): Promise<void> {
  await api.replaceOrganizationGrant(tenantId, userId, { roles }, { organizationId });
}

export async function revokeAccess(
  api: MarbleCoreApi,
  organizationId: string,
  { tenantId, userId }: { tenantId: string; userId: string },
): Promise<void> {
  await api.revokeOrganizationGrant(tenantId, userId, { organizationId });
}

export async function listTags(
  api: MarbleCoreApi,
  args?: { target?: 'case' | 'object'; withCaseCount?: boolean },
): Promise<Tag[]> {
  const withCaseCount = args?.withCaseCount ?? false;
  const { tags } = await api.listTags({ target: args?.target, withCaseCount });
  return tags;
}

export async function updateOrganization(
  api: MarbleCoreApi,
  organizationId: string,
  changes: OrganizationUpdateInput,
): Promise<Organization> {
  const { organization } = await api.updateOrganization(organizationId, {
    ...(changes.defaultScenarioTimezone && {
      default_scenario_timezone: changes.defaultScenarioTimezone,
    }),
    ...(changes.sanctionLimit && {
      sanctions_limit: changes.sanctionLimit,
    }),
    ...(changes.sanctionThreshold && {
      sanctions_threshold: changes.sanctionThreshold,
    }),
    ...(changes.autoAssignQueueLimit && {
      auto_assign_queue_limit: changes.autoAssignQueueLimit,
    }),
    ...(changes.screeningProviders && {
      screening_providers: {
        manual_search: changes.screeningProviders.manualSearch,
        transaction_monitoring: changes.screeningProviders.transactionMonitoring,
        continuous_monitoring: changes.screeningProviders.continuousMonitoring,
      },
    }),
  });

  return adaptOrganizationDto(organization);
}

// if GET /me/organizations does not exist on the backend, it will return [] (essentially for e2e tests).
export async function readMyOrganizations<T>(list: () => Promise<{ organizations: T[] }>): Promise<T[]> {
  try {
    const { organizations } = await list();
    return organizations ?? [];
  } catch (error) {
    if (isNotFoundHttpError(error)) return [];
    throw error;
  }
}
