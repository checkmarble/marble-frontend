import { dashboardPreferencesPatchSchema } from '@bo/schemas/dashboard';
import { getDashboardPreferences, getStoredDashboardPreferences } from '@bo/utils/dashboard-preferences';
import { describe, expect, it } from 'vitest';

describe('dashboard preferences', () => {
  it('defaults to six months and All for absent preferences or another account', () => {
    const defaults = { months: 6, modes: { organizations: 'all', tenants: 'all', users: 'all', licenses: 'all' } };
    expect(getDashboardPreferences(undefined, 'alice')).toEqual(defaults);
    expect(getDashboardPreferences({ userId: 'bob', months: 12, modes: { users: 'new' } }, 'alice')).toEqual(defaults);
    expect(getDashboardPreferences({ userId: 'alice', months: 12 }, undefined)).toEqual(defaults);
  });

  it('retains valid individual selections while defaulting malformed fields', () => {
    expect(
      getDashboardPreferences(
        { userId: 'alice', months: 2, modes: { organizations: 'new', tenants: 'wrong' } },
        'alice',
      ),
    ).toEqual({ months: 6, modes: { organizations: 'new', tenants: 'all', users: 'all', licenses: 'all' } });
    expect(getStoredDashboardPreferences({ userId: 'alice', months: 3, extra: 'ignored' })).toEqual({
      userId: 'alice',
      months: 3,
      modes: { organizations: 'all', tenants: 'all', users: 'all', licenses: 'all' },
    });
    expect(getStoredDashboardPreferences({ userId: 'x'.repeat(129), months: 12 })).toBeUndefined();
  });

  it.each([1, 3, 6, 12])('accepts the allowed %i month range', (months) => {
    expect(dashboardPreferencesPatchSchema.parse({ months, modes: { users: 'new', organizations: 'all' } })).toEqual({
      months,
      modes: { users: 'new', organizations: 'all' },
    });
  });

  it.each([
    { months: 2 },
    { months: '6' },
    { modes: { users: 'invalid' } },
    { modes: { other: 'new' } },
    { userId: 'bob' },
  ])('rejects invalid settings or client supplied account identity: %j', (patch) => {
    expect(dashboardPreferencesPatchSchema.safeParse(patch).success).toBe(false);
  });
});
