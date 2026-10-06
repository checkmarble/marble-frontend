import type { Tenant, TenantOrganization } from '@bo/data/tenants';
import { type ReactNode, useState } from 'react';
import { Panel, RadioGroup, RadioGroupItem, Tag, Typo } from 'ui-design-system';
import {
  groupTenantMembershipsByUser,
  type MembersByOrganization,
  type OrganizationMember,
  type UserMemberships,
} from './tenant-users';

type TenantUsersView = 'organization' | 'user';

export function TenantUsersPanel({
  tenant,
  organizations,
  membersByOrganization,
  onOpenChange,
}: {
  tenant: Tenant | null;
  organizations: TenantOrganization[];
  membersByOrganization: MembersByOrganization;
  onOpenChange: (open: boolean) => void;
}) {
  const [view, setView] = useState<TenantUsersView>('organization');

  const renderBody = () => {
    if (organizations.length === 0) {
      return <p className="text-grey-secondary text-s">No organizations in this tenant.</p>;
    }
    if (view === 'organization') {
      return organizations.map((organization) => (
        <OrganizationMembers
          key={organization.id}
          organization={organization}
          members={membersByOrganization.get(organization.id) ?? []}
        />
      ));
    }

    const usersMemberships = groupTenantMembershipsByUser(organizations, membersByOrganization);
    if (usersMemberships.length === 0) {
      return <p className="text-grey-secondary text-s">No users</p>;
    }
    return usersMemberships.map((userMemberships) => (
      <UserMembershipsGroup key={userMemberships.user.user_id} {...userMemberships} />
    ));
  };

  return (
    <Panel.Root open={tenant !== null} onOpenChange={onOpenChange}>
      <Panel.Container size="medium">
        <Panel.Content>
          <Panel.Header>
            <div className="flex flex-col gap-2xs">
              <span>Users</span>
              <p className="text-grey-secondary text-small font-normal">{tenant?.name}</p>
            </div>
          </Panel.Header>
          <div className="flex flex-col gap-lg">
            <RadioGroup
              value={view}
              onValueChange={(value) => setView(value as TenantUsersView)}
              aria-label="Group users"
            >
              <RadioGroupItem value="organization">By organization</RadioGroupItem>
              <RadioGroupItem value="user">By user</RadioGroupItem>
            </RadioGroup>
            {renderBody()}
          </div>
          <Panel.Footer>
            <Panel.FooterButton isCloseButton label="Close" />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

function OrganizationMembers({
  organization,
  members,
}: {
  organization: TenantOrganization;
  members: OrganizationMember[];
}) {
  return (
    <div className="flex flex-col gap-xs">
      <Typo variant="subtitle1">
        {organization.name} <span className="text-grey-secondary text-s font-normal">({members.length})</span>
      </Typo>
      {members.length === 0 ? (
        <p className="text-grey-secondary text-s">No users</p>
      ) : (
        <MemberList>
          {members.map(({ user, role }) => (
            <MemberRow key={user.user_id} role={role}>
              <div className="flex min-w-0 flex-col">
                <span className="text-grey-primary truncate text-s font-medium">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-grey-secondary truncate text-xs">{user.email}</span>
              </div>
            </MemberRow>
          ))}
        </MemberList>
      )}
    </div>
  );
}

function UserMembershipsGroup({ user, memberships }: UserMemberships) {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex min-w-0 flex-col">
        <Typo variant="subtitle1" className="truncate">
          {user.first_name} {user.last_name}
        </Typo>
        <span className="text-grey-secondary truncate text-xs">{user.email}</span>
      </div>
      <MemberList>
        {memberships.map(({ organization, role }) => (
          <MemberRow key={organization.id} role={role}>
            <span className="text-grey-primary min-w-0 truncate text-s font-medium">{organization.name}</span>
          </MemberRow>
        ))}
      </MemberList>
    </div>
  );
}

function MemberList({ children }: { children: ReactNode }) {
  return (
    <ul className="border-grey-border bg-surface-card divide-grey-border divide-y overflow-hidden rounded-lg border">
      {children}
    </ul>
  );
}

function MemberRow({ role, children }: { role: string; children: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-md px-md py-sm">
      {children}
      <Tag color="grey" size="small">
        {role}
      </Tag>
    </li>
  );
}
