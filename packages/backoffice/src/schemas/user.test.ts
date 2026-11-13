import { describe, expect, it } from 'vitest';
import { replaceOrganizationGrantPayloadSchema, updateGlobalUserPayloadSchema } from './user';

describe('global user update roles', () => {
  const user = {
    userId: '8ce408f6-8c77-4576-a708-15fb497c3d6c',
    first_name: 'First',
    last_name: 'Last',
    email: 'user@example.com',
    roles: [{ id: 'binding-id', role: 'ADMIN' }],
  };

  it('accepts one role binding and preserves its ID', () => {
    expect(updateGlobalUserPayloadSchema.parse(user).roles).toEqual(user.roles);
    expect(updateGlobalUserPayloadSchema.safeParse({ ...user, roles: [] }).success).toBe(false);
    expect(
      updateGlobalUserPayloadSchema.safeParse({ ...user, roles: [...user.roles, { role: 'ANALYST' }] }).success,
    ).toBe(false);
  });
});

describe('organization grant roles', () => {
  const grant = {
    userId: '8ce408f6-8c77-4576-a708-15fb497c3d6c',
    organizationId: '6ce408f6-8c77-4576-a708-15fb497c3d6c',
    tenantId: '7ce408f6-8c77-4576-a708-15fb497c3d6c',
    roles: [{ id: 'binding-id', role: 'ADMIN' }],
  };

  it('requires a role binding array and preserves its ID', () => {
    expect(replaceOrganizationGrantPayloadSchema.parse(grant).roles).toEqual(grant.roles);
    expect(replaceOrganizationGrantPayloadSchema.safeParse({ ...grant, roles: [] }).success).toBe(false);
    expect(replaceOrganizationGrantPayloadSchema.safeParse({ ...grant, roles: undefined, role: 'ADMIN' }).success).toBe(
      false,
    );
  });
});
