import { describe, expect, it } from 'vitest';
import {
  createCustomRoleSchema,
  deleteCustomRoleSchema,
  updateCustomRolePermissionsSchema,
  updateCustomRoleSectionsSchema,
} from './custom-roles';

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

describe('custom role sections', () => {
  it('accepts a partial visibility map, including sections this frontend does not know', () => {
    expect(
      updateCustomRoleSectionsSchema.safeParse({
        role: 'org/analyst',
        sections: { settings: false, case_manager: true, unknown_section: false },
      }).success,
    ).toBe(true);
  });

  it('rejects non-boolean values', () => {
    expect(
      updateCustomRoleSectionsSchema.safeParse({ role: 'org/analyst', sections: { settings: 'hidden' } }).success,
    ).toBe(false);
  });
});

describe('custom role deletion', () => {
  it('accepts organization-scoped slugs', () => {
    expect(deleteCustomRoleSchema.parse({ slug: 'org/fraud.analyst' })).toEqual({ slug: 'org/fraud.analyst' });
  });

  it('accepts existing slugs the creation form would reject', () => {
    const slug = 'org/tier_2.analyst';
    expect(createCustomRoleSchema.safeParse({ name: 'Analyst', slug }).success).toBe(false);
    expect(deleteCustomRoleSchema.safeParse({ slug }).success).toBe(true);
    expect(updateCustomRolePermissionsSchema.safeParse({ role: slug, permissions: [] }).success).toBe(true);
    expect(updateCustomRoleSectionsSchema.safeParse({ role: slug, sections: {} }).success).toBe(true);
  });

  it.each(['ADMIN', 'org/'])('rejects non-custom slug %s', (slug) => {
    expect(deleteCustomRoleSchema.safeParse({ slug }).success).toBe(false);
  });
});
