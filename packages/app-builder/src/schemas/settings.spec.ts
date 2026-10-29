import { describe, expect, it } from 'vitest';

import { createUserPayloadSchema, updateUserPayloadSchema } from './settings';

describe('user role bindings', () => {
  const user = {
    userId: '8ce408f6-8c77-4576-a708-15fb497c3d6c',
    organizationId: '6ce408f6-8c77-4576-a708-15fb497c3d6c',
    firstName: 'First',
    lastName: 'Last',
    email: 'user@example.com',
    roles: [{ id: 'binding-id', role: 'ADMIN' }],
  };

  it('preserves an existing ID in user update payloads', () => {
    expect(updateUserPayloadSchema.parse(user).roles).toEqual(user.roles);
  });

  it.each([createUserPayloadSchema, updateUserPayloadSchema])('requires exactly one role', (schema) => {
    expect(schema.safeParse({ ...user, roles: [] }).success).toBe(false);
    expect(schema.safeParse({ ...user, roles: [{ role: 'ADMIN' }, { role: 'ANALYST' }] }).success).toBe(false);
    expect(schema.parse({ ...user, roles: [{ role: 'ANALYST' }] }).roles).toEqual([{ role: 'ANALYST' }]);
  });
});
