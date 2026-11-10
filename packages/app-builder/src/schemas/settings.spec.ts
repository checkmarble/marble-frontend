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

  it('requires at least one role when creating a user', () => {
    expect(createUserPayloadSchema.safeParse({ ...user, roles: [] }).success).toBe(false);
    expect(
      createUserPayloadSchema.safeParse({ ...user, roles: [{ role: 'ADMIN' }, { role: 'ANALYST' }] }).success,
    ).toBe(true);
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

  it('preserves conditions on submitted role bindings', () => {
    const roles = [
      {
        role: 'ADMIN',
        conditions: {
          not_before: '2026-01-01T00:00:00Z',
          not_after: '2027-01-01T00:00:00Z',
          day_of_week: [1, 2, 3, 4, 5],
          time_of_day: [2200, 600],
          networks: ['192.0.2.0/24', '2001:db8::1'],
          used_second_factor: false,
        },
      },
    ];

    expect(createUserPayloadSchema.parse({ ...user, roles }).roles).toEqual(roles);
    for (const schema of [grantOrganizationAccessPayloadSchema, updateOrganizationUserPayloadSchema]) {
      expect(schema.parse({ userId: user.userId, roles }).roles).toEqual(roles);
    }
  });

  it('validates condition ranges and networks while allowing overnight windows', () => {
    const payload = (conditions: unknown) => ({ userId: user.userId, roles: [{ role: 'ADMIN', conditions }] });
    expect(
      grantOrganizationAccessPayloadSchema.safeParse(
        payload({ time_of_day: [2200, 600], day_of_week: [1, 7], networks: ['2001:db8::1'] }),
      ).success,
    ).toBe(true);
    for (const conditions of [
      { time_of_day: [900, -1] },
      { time_of_day: [1260, 1400] },
      { day_of_week: [0] },
      { day_of_week: [8] },
      { networks: ['invalid'] },
      { not_before: '2026-01-01T10:00' },
      { not_before: '2026-01-02T00:00:00Z', not_after: '2026-01-01T00:00:00Z' },
    ]) {
      expect(grantOrganizationAccessPayloadSchema.safeParse(payload(conditions)).success).toBe(false);
    }
  });

  it('accepts multiple custom and built-in roles for creation, grants, and updates', () => {
    const roles = [{ role: 'org/fraud.analyst' }];
    expect(createUserPayloadSchema.parse({ ...user, roles }).roles).toEqual(roles);
    for (const schema of [grantOrganizationAccessPayloadSchema, updateOrganizationUserPayloadSchema]) {
      expect(schema.parse({ userId: user.userId, roles }).roles).toEqual(roles);
      expect(schema.safeParse({ userId: user.userId, roles: [...roles, { role: 'ADMIN' }] }).success).toBe(true);
    }
  });
});
