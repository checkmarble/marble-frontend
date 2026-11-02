import { describe, expect, it } from 'vitest';

import {
  createUserPayloadSchema,
  grantOrganizationAccessPayloadSchema,
  updateOrganizationUserPayloadSchema,
} from './settings';

describe('user role bindings', () => {
  const user = {
    userId: '8ce408f6-8c77-4576-a708-15fb497c3d6c',
    organizationId: '6ce408f6-8c77-4576-a708-15fb497c3d6c',
    firstName: 'First',
    lastName: 'Last',
    email: 'user@example.com',
    roles: [{ id: 'binding-id', role: 'ADMIN' }],
  };

  it('requires exactly one role when creating a user', () => {
    expect(createUserPayloadSchema.safeParse({ ...user, roles: [] }).success).toBe(false);
    expect(
      createUserPayloadSchema.safeParse({ ...user, roles: [{ role: 'ADMIN' }, { role: 'ANALYST' }] }).success,
    ).toBe(false);
    expect(createUserPayloadSchema.parse(user).roles).toEqual(user.roles);
  });

  it('accepts role bindings for grants and partial user updates', () => {
    expect(updateOrganizationUserPayloadSchema.parse({ userId: user.userId, firstName: 'New' })).toEqual({
      userId: user.userId,
      firstName: 'New',
    });
    for (const schema of [grantOrganizationAccessPayloadSchema, updateOrganizationUserPayloadSchema]) {
      expect(schema.parse({ userId: user.userId, roles: user.roles }).roles).toEqual(user.roles);
      expect(schema.safeParse({ userId: user.userId, roles: [] }).success).toBe(false);
      expect(schema.safeParse({ userId: user.userId, roles: [{ role: '' }] }).success).toBe(false);
    }
    expect(grantOrganizationAccessPayloadSchema.safeParse({ userId: user.userId, role: 'ADMIN' }).success).toBe(false);
  });

  it('accepts one custom role for creation, grants, and updates', () => {
    const roles = [{ role: 'org/fraud.analyst' }];
    expect(createUserPayloadSchema.parse({ ...user, roles }).roles).toEqual(roles);
    for (const schema of [grantOrganizationAccessPayloadSchema, updateOrganizationUserPayloadSchema]) {
      expect(schema.parse({ userId: user.userId, roles }).roles).toEqual(roles);
      expect(schema.safeParse({ userId: user.userId, roles: [...roles, { role: 'ADMIN' }] }).success).toBe(false);
    }
  });
});
