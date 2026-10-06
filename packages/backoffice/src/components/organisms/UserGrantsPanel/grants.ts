import type { Tenant } from '@bo/data/tenants';
import type { UserGrant } from '@bo/data/users';
import { GRANT_ROLES, type GrantRole } from '@bo/schemas/user';
import type { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import type { OrganizationDto, UserDto } from 'marble-api/generated/marblecore-api';

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

export type GrantOrganization = Pick<OrganizationDto, 'id' | 'name' | 'tenant_id'>;
export type GrantEntry = { organization: GrantOrganization; role: string };
type GrantsUser = Pick<UserDto, 'organization_id' | 'role'>;

export const hasHomeOrganization = (user: Pick<UserDto, 'organization_id'>) =>
  !!user.organization_id && user.organization_id !== NIL_UUID;

// MARBLE_ADMIN: the backend lets them hold grants in any tenant.
export const isCustomerServiceUser = (user: Pick<UserDto, 'role'>) => user.role === 'MARBLE_ADMIN';

export const canManageGrants = (user: GrantsUser) => isCustomerServiceUser(user) || hasHomeOrganization(user);

const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

const toEntries = (grants: UserGrant[], organizations: GrantOrganization[]): GrantEntry[] => {
  const organizationsById = new Map(organizations.map((organization) => [organization.id, organization]));
  return grants
    .map((grant) => ({
      organization: organizationsById.get(grant.organization_id) ?? {
        id: grant.organization_id,
        name: grant.organization_id,
        tenant_id: grant.tenant_id,
      },
      role: grant.role,
    }))
    .sort((a, b) => byName(a.organization, b.organization));
};

export type TenantGrantsView = {
  tenantId: string | undefined;
  // The home grant is written by "Edit user"; without one, the backend still relies on the legacy `user.role`.
  home: { organization: GrantOrganization; role: string; isLegacy: boolean } | null;
  grants: GrantEntry[];
  addable: GrantOrganization[];
};

export const getTenantGrantsView = ({
  user,
  grants,
  organizations,
}: {
  user: GrantsUser;
  grants: UserGrant[];
  organizations: GrantOrganization[];
}): TenantGrantsView => {
  const homeOrganization = organizations.find((organization) => organization.id === user.organization_id);
  const homeGrant = grants.find((grant) => grant.organization_id === user.organization_id);
  const grantedIds = new Set(grants.map((grant) => grant.organization_id));
  const tenantId = homeOrganization?.tenant_id;

  return {
    tenantId,
    home: homeOrganization
      ? { organization: homeOrganization, role: homeGrant?.role ?? user.role, isLegacy: !homeGrant }
      : null,
    grants: toEntries(
      grants.filter((grant) => grant.organization_id !== user.organization_id),
      organizations,
    ),
    addable: organizations
      .filter(
        (organization) =>
          organization.tenant_id === tenantId &&
          organization.id !== user.organization_id &&
          !grantedIds.has(organization.id),
      )
      .sort(byName),
  };
};

export type CustomerServiceGrantsView = {
  groups: { tenant: Tenant; grants: GrantEntry[] }[];
  addableByTenant: { tenant: Tenant; organizations: GrantOrganization[] }[];
};

export const getCustomerServiceGrantsView = ({
  grants,
  organizations,
  tenants,
}: {
  grants: UserGrant[];
  organizations: GrantOrganization[];
  tenants: Tenant[];
}): CustomerServiceGrantsView => {
  const entries = toEntries(grants, organizations);
  const grantedIds = new Set(grants.map((grant) => grant.organization_id));
  const knownTenantIds = new Set(tenants.map((tenant) => tenant.id));
  // Keep grants on tenants missing from the list visible rather than dropping them.
  const allTenants = [
    ...tenants,
    ...[...new Set(entries.map((entry) => entry.organization.tenant_id))]
      .filter((tenantId) => !knownTenantIds.has(tenantId))
      .map((tenantId) => ({ id: tenantId, name: tenantId })),
  ];

  return {
    groups: allTenants
      .map((tenant) => ({
        tenant,
        grants: entries.filter((entry) => entry.organization.tenant_id === tenant.id),
      }))
      .filter((group) => group.grants.length > 0),
    addableByTenant: tenants
      .map((tenant) => ({
        tenant,
        organizations: organizations
          .filter((organization) => organization.tenant_id === tenant.id && !grantedIds.has(organization.id))
          .sort(byName),
      }))
      .filter((group) => group.organizations.length > 0),
  };
};

// Mirrors the organization users page: organizations with restricted roles only get admins.
export const getAllowedGrantRoles = (rolesFeature: FeatureAccessDto['roles'] | undefined): readonly GrantRole[] => {
  if (!rolesFeature) return [];
  return rolesFeature === 'restricted' ? ['ADMIN'] : GRANT_ROLES;
};

// Keeps a role the organization no longer allows selectable, so the current state stays visible.
export const getGrantRoleOptions = (allowedRoles: readonly GrantRole[], currentRole?: string): string[] =>
  currentRole && !allowedRoles.some((role) => role === currentRole)
    ? [currentRole, ...allowedRoles]
    : [...allowedRoles];

export type UserOrganizationTag = { organizationId: string; label: string; isHome: boolean };

// Organizations a user can reach, for the users table: home first, then direct grants. Customer
// service users span tenants, so their tags carry the tenant name too.
export const getUserOrganizationTags = ({
  user,
  organizations,
  tenants,
}: {
  user: GrantsUser & Pick<UserDto, 'grants'>;
  organizations: GrantOrganization[];
  tenants: Tenant[];
}): UserOrganizationTag[] => {
  const organizationsById = new Map(organizations.map((organization) => [organization.id, organization]));
  const tenantNames = new Map(tenants.map((tenant) => [tenant.id, tenant.name]));
  const withTenant = isCustomerServiceUser(user);

  const toTag = (organizationId: string, tenantId: string | undefined, isHome: boolean): UserOrganizationTag => {
    const organization = organizationsById.get(organizationId);
    const name = organization?.name ?? organizationId;
    const resolvedTenantId = organization?.tenant_id ?? tenantId;
    const tenantName = resolvedTenantId ? (tenantNames.get(resolvedTenantId) ?? resolvedTenantId) : undefined;
    return {
      organizationId,
      label: withTenant && tenantName && tenantName !== name ? `${tenantName} / ${name}` : name,
      isHome,
    };
  };

  const homeTag = hasHomeOrganization(user) ? [toTag(user.organization_id, undefined, true)] : [];
  const grantTags = (user.grants ?? [])
    .filter((grant) => grant.organization_id !== user.organization_id)
    .map((grant) => toTag(grant.organization_id, grant.tenant_id, false))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

  return [...homeTag, ...grantTags];
};
