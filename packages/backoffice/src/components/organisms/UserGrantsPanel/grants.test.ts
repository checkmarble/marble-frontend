import { describe, expect, it } from 'vitest';
import {
  canManageGrants,
  getAllowedGrantRoles,
  getCustomerServiceGrantsView,
  getGrantRoleOptions,
  getTenantGrantsView,
  getUserOrganizationTags,
} from './grants';

const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';
const home = { id: 'org-home', name: 'Home', tenant_id: TENANT_A };
const zeta = { id: 'org-zeta', name: 'Zeta', tenant_id: TENANT_A };
const alpha = { id: 'org-alpha', name: 'alpha', tenant_id: TENANT_A };
const other = { id: 'org-other', name: 'Other', tenant_id: TENANT_B };
const organizations = [home, zeta, alpha, other];
const tenants = [
  { id: TENANT_A, name: 'Acme' },
  { id: TENANT_B, name: 'Globex' },
];

describe('canManageGrants', () => {
  it('needs a home organization unless the user is customer service', () => {
    expect(canManageGrants({ organization_id: home.id, role: 'VIEWER' })).toBe(true);
    expect(canManageGrants({ organization_id: '00000000-0000-0000-0000-000000000000', role: 'VIEWER' })).toBe(false);
    expect(canManageGrants({ organization_id: '', role: 'MARBLE_ADMIN' })).toBe(true);
  });
});

describe('getTenantGrantsView', () => {
  const user = { organization_id: home.id, role: 'ADMIN' };

  it('splits the home grant from the others and offers the rest of the tenant', () => {
    const view = getTenantGrantsView({
      user,
      organizations,
      grants: [
        { organization_id: home.id, tenant_id: TENANT_A, role: 'BUILDER' },
        { organization_id: zeta.id, tenant_id: TENANT_A, role: 'VIEWER' },
      ],
    });

    expect(view.tenantId).toBe(TENANT_A);
    expect(view.home).toEqual({ organization: home, role: 'BUILDER', isLegacy: false });
    expect(view.grants).toEqual([{ organization: zeta, role: 'VIEWER' }]);
    expect(view.addable).toEqual([alpha]);
  });

  it('falls back to the legacy role when the home grant is missing', () => {
    const view = getTenantGrantsView({ user, organizations, grants: [] });

    expect(view.home).toEqual({ organization: home, role: 'ADMIN', isLegacy: true });
    expect(view.addable).toEqual([alpha, zeta]);
  });
});

describe('getCustomerServiceGrantsView', () => {
  it('groups grants by tenant and offers every organization without a grant', () => {
    const view = getCustomerServiceGrantsView({
      tenants,
      organizations,
      grants: [
        { organization_id: other.id, tenant_id: TENANT_B, role: 'ADMIN' },
        { organization_id: zeta.id, tenant_id: TENANT_A, role: 'VIEWER' },
        { organization_id: alpha.id, tenant_id: TENANT_A, role: 'ANALYST' },
      ],
    });

    expect(view.groups).toEqual([
      {
        tenant: tenants[0],
        grants: [
          { organization: alpha, role: 'ANALYST' },
          { organization: zeta, role: 'VIEWER' },
        ],
      },
      { tenant: tenants[1], grants: [{ organization: other, role: 'ADMIN' }] },
    ]);
    expect(view.addableByTenant).toEqual([{ tenant: tenants[0], organizations: [home] }]);
  });

  it('keeps grants on unknown tenants and organizations', () => {
    const view = getCustomerServiceGrantsView({
      tenants: [],
      organizations: [],
      grants: [{ organization_id: 'org-gone', tenant_id: 'tenant-gone', role: 'VIEWER' }],
    });

    expect(view.groups).toEqual([
      {
        tenant: { id: 'tenant-gone', name: 'tenant-gone' },
        grants: [{ organization: { id: 'org-gone', name: 'org-gone', tenant_id: 'tenant-gone' }, role: 'VIEWER' }],
      },
    ]);
  });
});

describe('grant roles', () => {
  it('only offers ADMIN on restricted organizations', () => {
    expect(getAllowedGrantRoles('restricted')).toEqual(['ADMIN']);
    expect(getAllowedGrantRoles('allowed')).toContain('VIEWER');
    expect(getAllowedGrantRoles(undefined)).toEqual([]);
  });

  it('keeps a current role that is no longer allowed', () => {
    expect(getGrantRoleOptions(['ADMIN'], 'VIEWER')).toEqual(['VIEWER', 'ADMIN']);
    expect(getGrantRoleOptions(['ADMIN'], 'ADMIN')).toEqual(['ADMIN']);
  });
});

describe('getUserOrganizationTags', () => {
  it('lists the home organization first, then the granted ones', () => {
    const tags = getUserOrganizationTags({
      organizations,
      tenants,
      user: {
        organization_id: home.id,
        role: 'VIEWER',
        grants: [
          { organization_id: zeta.id, tenant_id: TENANT_A, role: 'VIEWER' },
          { organization_id: home.id, tenant_id: TENANT_A, role: 'VIEWER' },
          { organization_id: alpha.id, tenant_id: TENANT_A, role: 'ADMIN' },
        ],
      },
    });

    expect(tags).toEqual([
      { organizationId: home.id, label: 'Home', isHome: true },
      { organizationId: alpha.id, label: 'alpha', isHome: false },
      { organizationId: zeta.id, label: 'Zeta', isHome: false },
    ]);
  });

  it('prefixes customer service tags with the tenant', () => {
    const tags = getUserOrganizationTags({
      organizations,
      tenants,
      user: {
        organization_id: '00000000-0000-0000-0000-000000000000',
        role: 'MARBLE_ADMIN',
        grants: [
          { organization_id: other.id, tenant_id: TENANT_B, role: 'ADMIN' },
          { organization_id: zeta.id, tenant_id: TENANT_A, role: 'VIEWER' },
        ],
      },
    });

    expect(tags.map((tag) => tag.label)).toEqual(['Acme / Zeta', 'Globex / Other']);
  });

  it('is empty for an unassigned user without grants', () => {
    expect(getUserOrganizationTags({ organizations, tenants, user: { organization_id: '', role: 'VIEWER' } })).toEqual(
      [],
    );
  });
});
