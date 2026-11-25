import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptUser, isNotFoundHttpError, type TenantUser, type User } from '@app-builder/models';
import {
  adaptOrganizationDto,
  adaptUserOrganization,
  type Organization,
  type OrganizationUpdateInput,
  type UserOrganization,
} from '@app-builder/models/organization';
import {
  adaptTenantDomain,
  adaptTenantOidcConfiguration,
  type TenantDomain,
  type TenantOidcConfiguration,
  type TenantOidcConfigurationInput,
} from '@app-builder/models/tenant-oidc';
import { type OrganizationGrantRole } from '@app-builder/schemas/settings';
import { type Tag, type UserDto } from 'marble-api';

export interface OrganizationRepository {
  getCurrentOrganization(): Promise<Organization>;
  listMyOrganizations(): Promise<UserOrganization[]>;
  exportOrganization(): Promise<unknown>;
  importOrganization(body: unknown): Promise<{ org_id: string }>;
  importOrganizationFromFile(file: Blob): Promise<{ org_id: string }>;
  listUsers(args?: { withTfa?: boolean }): Promise<User[]>;
  listTenantUsersWithoutAccess(): Promise<TenantUser[]>;
  grantAccess(args: { tenantId: string; userId: string; role: OrganizationGrantRole }): Promise<void>;
  revokeAccess(args: { tenantId: string; userId: string }): Promise<void>;
  updateUserName(args: { userId: string; firstName?: string; lastName?: string }): Promise<void>;
  listTags(args?: { target?: 'case' | 'object'; withCaseCount?: boolean }): Promise<Tag[]>;
  updateOrganization(args: { organizationId: string; changes: OrganizationUpdateInput }): Promise<Organization>;
  updateAllowedNetworks(organizationId: string, allowedNetworks: string[]): Promise<string[]>;
  /** `null` when the tenant has no OIDC configuration yet. */
  getTenantOidcConfiguration(tenantId: string): Promise<TenantOidcConfiguration | null>;
  putTenantOidcConfiguration(tenantId: string, input: TenantOidcConfigurationInput): Promise<void>;
  listTenantOidcDomains(tenantId: string): Promise<TenantDomain[]>;
  createTenantOidcDomain(tenantId: string, domain: string): Promise<void>;
}

export function makeGetOrganizationRepository() {
  return (marbleCoreApiClient: MarbleCoreApi, organizationId: string): OrganizationRepository => ({
    getCurrentOrganization: async () => {
      const { organization } = await marbleCoreApiClient.getOrganization(organizationId);

      return adaptOrganizationDto(organization);
    },
    listMyOrganizations: async () => {
      const organizations = await readMyOrganizations(() => marbleCoreApiClient.listMyOrganizations());
      return organizations.map(adaptUserOrganization);
    },
    exportOrganization: async () => {
      return marbleCoreApiClient.exportOrganization();
    },
    importOrganization: async (body) => {
      return marbleCoreApiClient.importOrganization(body);
    },
    importOrganizationFromFile: async (file) => {
      return marbleCoreApiClient.importOrganizationFromFile({ file });
    },
    listUsers: async (args) => {
      const { users } = await marbleCoreApiClient.listUsers({
        organizationId,
        withTfa: args?.withTfa ?? false,
      });
      // Without `tenantAccess`, the endpoint returns plain users
      return (users as UserDto[]).map(adaptUser);
    },
    listTenantUsersWithoutAccess: async () => {
      const { users } = await marbleCoreApiClient.listUsers({ organizationId, tenantAccess: 'missing' });
      return users.map((user) => ({
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      }));
    },
    grantAccess: async ({ tenantId, userId, role }) => {
      await marbleCoreApiClient.replaceOrganizationGrant(tenantId, userId, { role }, { organizationId });
    },
    revokeAccess: async ({ tenantId, userId }) => {
      await marbleCoreApiClient.revokeOrganizationGrant(tenantId, userId, { organizationId });
    },
    updateUserName: async ({ userId, firstName, lastName }) => {
      await marbleCoreApiClient.updateUser(userId, { first_name: firstName, last_name: lastName });
    },
    listTags: async (args) => {
      const withCaseCount = args?.withCaseCount ?? false;
      const { tags } = await marbleCoreApiClient.listTags({ target: args?.target, withCaseCount });
      return tags;
    },
    updateOrganization: async (args) => {
      const { organization } = await marbleCoreApiClient.updateOrganization(organizationId, {
        ...(args.changes.defaultScenarioTimezone && {
          default_scenario_timezone: args.changes.defaultScenarioTimezone,
        }),
        ...(args.changes.sanctionLimit && {
          sanctions_limit: args.changes.sanctionLimit,
        }),
        ...(args.changes.sanctionThreshold && {
          sanctions_threshold: args.changes.sanctionThreshold,
        }),
        ...(args.changes.autoAssignQueueLimit && {
          auto_assign_queue_limit: args.changes.autoAssignQueueLimit,
        }),
        ...(args.changes.screeningProviders && {
          screening_providers: {
            manual_search: args.changes.screeningProviders.manualSearch,
            transaction_monitoring: args.changes.screeningProviders.transactionMonitoring,
            continuous_monitoring: args.changes.screeningProviders.continuousMonitoring,
          },
        }),
      });

      return adaptOrganizationDto(organization);
    },
    updateAllowedNetworks: async (organizationId: string, allowedNetworks: string[]) => {
      return await marbleCoreApiClient.updateOrganizationSubnets(organizationId, {
        subnets: allowedNetworks,
      });
    },
    getTenantOidcConfiguration: async (tenantId) => {
      try {
        return adaptTenantOidcConfiguration(await marbleCoreApiClient.getTenantOidcConfiguration(tenantId));
      } catch (error) {
        if (isNotFoundHttpError(error)) return null;
        throw error;
      }
    },
    putTenantOidcConfiguration: async (tenantId, input) => {
      // A full replace: the backend resets any omitted field, and an omitted `sso_enabled` means true.
      await marbleCoreApiClient.putTenantOidcConfiguration(tenantId, {
        issuer: input.issuer,
        client_id: input.clientId,
        client_secret: input.clientSecret,
        scopes: input.scopes,
        extra_params: input.extraParams,
        email_claim: input.emailClaim,
        sso_enabled: input.ssoEnabled,
      });
    },
    listTenantOidcDomains: async (tenantId) => {
      const domains = await marbleCoreApiClient.listTenantOidcDomains(tenantId);
      return domains.map(adaptTenantDomain);
    },
    createTenantOidcDomain: async (tenantId, domain) => {
      // Without `verified`, the domain stays pending until a Marble admin verifies it.
      await marbleCoreApiClient.createTenantOidcDomain(tenantId, { domain });
    },
  });
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
