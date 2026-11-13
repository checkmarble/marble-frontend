import { describe, expect, it } from 'vitest';
import { createCustomRoleSchema, updateCustomRolePermissionsSchema } from './custom-roles';

describe('custom role creation', () => {
  it('accepts organization-scoped slugs and trims names', () => {
    expect(createCustomRoleSchema.parse({ name: ' Analyst ', slug: 'org/fraud.analyst' })).toEqual({
      name: 'Analyst',
      slug: 'org/fraud.analyst',
    });
  });

  it.each(['org/', 'fraud', 'org/fraud-analyst', 'org/fraud123', 'org/fraud/analyst'])(
    'rejects invalid slug %s',
    (slug) => {
      expect(createCustomRoleSchema.safeParse({ name: 'Analyst', slug }).success).toBe(false);
    },
  );

  it('rejects blank names', () => {
    expect(createCustomRoleSchema.safeParse({ name: '  ', slug: 'org/analyst' }).success).toBe(false);
  });
});

describe('custom role permissions', () => {
  it('accepts organization and newer backend permissions and rejects platform and duplicate permissions', () => {
    expect(
      updateCustomRolePermissionsSchema.safeParse({ role: 'org/analyst', permissions: ['CASE_READ_WRITE'] }).success,
    ).toBe(true);
    expect(
      updateCustomRolePermissionsSchema.safeParse({ role: 'org/analyst', permissions: ['NEW_PERMISSION'] }).success,
    ).toBe(true);
    for (const permissions of [['ORGANIZATIONS_CREATE'], [''], ['CASE_READ_WRITE', 'CASE_READ_WRITE']]) {
      expect(updateCustomRolePermissionsSchema.safeParse({ role: 'org/analyst', permissions }).success).toBe(false);
    }
  });
});
