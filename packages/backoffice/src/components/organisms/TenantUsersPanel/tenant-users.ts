import { hasHomeOrganization } from '@bo/components/organisms/UserGrantsPanel/grants';
import type { TenantOrganization } from '@bo/data/tenants';
import type { UserDto } from 'marble-api/generated/marblecore-api';

export type OrganizationMember = { user: UserDto; role: string };
export type MembersByOrganization = ReadonlyMap<string, OrganizationMember[]>;

const byUserName = (a: { user: UserDto }, b: { user: UserDto }) =>
  `${a.user.first_name} ${a.user.last_name}`.localeCompare(`${b.user.first_name} ${b.user.last_name}`, undefined, {
    sensitivity: 'base',
  });

// Users of each organization: home members first take their home grant role (falling back on
// the legacy `user.role`, like the grants panel), then users reaching it through a direct grant.
export const groupMembersByOrganization = (users: UserDto[]): MembersByOrganization => {
  const grouped = new Map<string, OrganizationMember[]>();
  const add = (organizationId: string, member: OrganizationMember) => {
    grouped.set(organizationId, [...(grouped.get(organizationId) ?? []), member]);
  };

  for (const user of users) {
    const grants = user.grants ?? [];
    if (hasHomeOrganization(user)) {
      const homeGrant = grants.find((grant) => grant.organization_id === user.organization_id);
      add(user.organization_id, { user, role: homeGrant?.role ?? user.role });
    }
    for (const grant of grants) {
      if (grant.organization_id === user.organization_id) continue;
      add(grant.organization_id, { user, role: grant.role });
    }
  }

  for (const members of grouped.values()) members.sort(byUserName);
  return grouped;
};

export const countTenantUsers = (organizationIds: string[], membersByOrganization: MembersByOrganization) =>
  new Set(
    organizationIds.flatMap((organizationId) =>
      (membersByOrganization.get(organizationId) ?? []).map(({ user }) => user.user_id),
    ),
  ).size;

export type UserMemberships = { user: UserDto; memberships: { organization: TenantOrganization; role: string }[] };

// The same memberships regrouped per user; organizations keep the order they are given in.
export const groupTenantMembershipsByUser = (
  organizations: TenantOrganization[],
  membersByOrganization: MembersByOrganization,
): UserMemberships[] => {
  const byUser = new Map<string, UserMemberships>();
  for (const organization of organizations) {
    for (const { user, role } of membersByOrganization.get(organization.id) ?? []) {
      const entry = byUser.get(user.user_id) ?? { user, memberships: [] };
      entry.memberships.push({ organization, role });
      byUser.set(user.user_id, entry);
    }
  }
  return [...byUser.values()].sort(byUserName);
};
