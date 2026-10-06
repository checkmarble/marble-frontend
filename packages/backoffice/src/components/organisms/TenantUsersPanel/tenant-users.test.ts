import { describe, expect, it } from 'vitest';
import { countTenantUsers, groupMembersByOrganization, groupTenantMembershipsByUser } from './tenant-users';

const TENANT = 'tenant-a';
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

const makeUser = (
  user_id: string,
  first_name: string,
  organization_id: string,
  role: string,
  grants: { organization_id: string; role: 'ADMIN' | 'BUILDER' | 'VIEWER' }[] = [],
) => ({
  user_id,
  email: `${user_id}@example.com`,
  first_name,
  last_name: 'Doe',
  role,
  organization_id,
  grants: grants.map((grant) => ({ ...grant, tenant_id: TENANT })),
});

describe('groupMembersByOrganization', () => {
  it('lists home members with their home grant role and granted users with their grant role', () => {
    const zoe = makeUser('zoe', 'Zoe', 'org-a', 'VIEWER', [
      { organization_id: 'org-a', role: 'ADMIN' },
      { organization_id: 'org-b', role: 'BUILDER' },
    ]);
    const bob = makeUser('bob', 'bob', 'org-a', 'VIEWER');

    const grouped = groupMembersByOrganization([zoe, bob]);

    expect(grouped.get('org-a')).toEqual([
      { user: bob, role: 'VIEWER' },
      { user: zoe, role: 'ADMIN' },
    ]);
    expect(grouped.get('org-b')).toEqual([{ user: zoe, role: 'BUILDER' }]);
  });

  it('ignores users without a home organization unless they hold grants', () => {
    const admin = makeUser('admin', 'Admin', NIL_UUID, 'MARBLE_ADMIN', [{ organization_id: 'org-b', role: 'ADMIN' }]);
    const orphan = makeUser('orphan', 'Orphan', NIL_UUID, 'VIEWER');

    const grouped = groupMembersByOrganization([admin, orphan]);

    expect([...grouped.keys()]).toEqual(['org-b']);
    expect(grouped.get('org-b')).toEqual([{ user: admin, role: 'ADMIN' }]);
  });
});

describe('countTenantUsers', () => {
  it('counts each user once across the tenant organizations', () => {
    const zoe = makeUser('zoe', 'Zoe', 'org-a', 'VIEWER', [{ organization_id: 'org-b', role: 'BUILDER' }]);
    const bob = makeUser('bob', 'Bob', 'org-c', 'VIEWER');
    const grouped = groupMembersByOrganization([zoe, bob]);

    expect(countTenantUsers(['org-a', 'org-b'], grouped)).toBe(1);
    expect(countTenantUsers(['org-a', 'org-b', 'org-c'], grouped)).toBe(2);
    expect(countTenantUsers([], grouped)).toBe(0);
  });
});

describe('groupTenantMembershipsByUser', () => {
  it('lists each user with their roles on the given organizations only, sorted by name', () => {
    const orgA = { id: 'org-a', name: 'A' };
    const orgB = { id: 'org-b', name: 'B' };
    const zoe = makeUser('zoe', 'Zoe', 'org-a', 'VIEWER', [
      { organization_id: 'org-b', role: 'BUILDER' },
      { organization_id: 'org-c', role: 'ADMIN' },
    ]);
    const bob = makeUser('bob', 'Bob', 'org-b', 'ADMIN');
    const grouped = groupMembersByOrganization([zoe, bob]);

    expect(groupTenantMembershipsByUser([orgA, orgB], grouped)).toEqual([
      { user: bob, memberships: [{ organization: orgB, role: 'ADMIN' }] },
      {
        user: zoe,
        memberships: [
          { organization: orgA, role: 'VIEWER' },
          { organization: orgB, role: 'BUILDER' },
        ],
      },
    ]);
  });
});
