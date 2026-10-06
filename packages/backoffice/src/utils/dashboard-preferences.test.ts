import { dashboardPreferencesPatchSchema } from '@bo/schemas/dashboard';
import { getDashboardPreferences, getStoredDashboardPreferences } from '@bo/utils/dashboard-preferences';
import { describe, expect, it } from 'vitest';

describe('dashboard preferences', () => {
  it('defaults to six months and organizations for absent preferences or another account', () => {
    const defaults = { months: 6, indicator: 'organizations' };
    expect(getDashboardPreferences(undefined, 'alice')).toEqual(defaults);
    expect(getDashboardPreferences({ userId: 'bob', months: 12, indicator: 'users' }, 'alice')).toEqual(defaults);
    expect(getDashboardPreferences({ userId: 'alice', months: 12 }, undefined)).toEqual(defaults);
  });

  it('retains valid individual selections while defaulting malformed fields', () => {
    expect(getDashboardPreferences({ userId: 'alice', months: 2, indicator: 'tenants' }, 'alice')).toEqual({
      months: 6,
      indicator: 'tenants',
    });
    expect(getDashboardPreferences({ userId: 'alice', months: 12, indicator: 'wrong' }, 'alice')).toEqual({
      months: 12,
      indicator: 'organizations',
    });
    expect(
      getStoredDashboardPreferences({ userId: 'alice', months: 3, modes: { users: 'new' }, extra: 'ignored' }),
    ).toEqual({ userId: 'alice', months: 3, indicator: 'organizations' });
    expect(getStoredDashboardPreferences({ userId: 'x'.repeat(129), months: 12 })).toBeUndefined();
  });

  it.each([1, 3, 6, 12])('accepts the allowed %i month range', (months) => {
    expect(dashboardPreferencesPatchSchema.parse({ months, indicator: 'licenses' })).toEqual({
      months,
      indicator: 'licenses',
    });
  });

  it.each([{ months: 2 }, { months: '6' }, { indicator: 'invalid' }, { modes: { users: 'new' } }, { userId: 'bob' }])(
    'rejects invalid settings or client supplied account identity: %j',
    (patch) => {
      expect(dashboardPreferencesPatchSchema.safeParse(patch).success).toBe(false);
    },
  );
});
