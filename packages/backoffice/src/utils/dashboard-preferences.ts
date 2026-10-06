import {
  type DashboardEntity,
  type DashboardMode,
  type DashboardMonths,
  type DashboardPreferencesPatch,
  dashboardModeSchema,
  dashboardMonthsSchema,
} from '@bo/schemas/dashboard';

export type DashboardPreferences = {
  months: DashboardMonths;
  modes: Record<DashboardEntity, DashboardMode>;
};
export type StoredDashboardPreferences = DashboardPreferences & { userId: string };

export function getDashboardPreferences(stored: unknown, userId: string | undefined): DashboardPreferences {
  const defaults: DashboardPreferences = {
    months: 6,
    modes: { organizations: 'all', tenants: 'all', users: 'all', licenses: 'all' },
  };
  if (!userId || !stored || typeof stored !== 'object' || !('userId' in stored) || stored.userId !== userId) {
    return defaults;
  }

  const months = dashboardMonthsSchema.safeParse('months' in stored ? stored.months : undefined);
  const modes = 'modes' in stored && stored.modes && typeof stored.modes === 'object' ? stored.modes : {};
  const organizations = dashboardModeSchema.safeParse('organizations' in modes ? modes.organizations : undefined);
  const tenants = dashboardModeSchema.safeParse('tenants' in modes ? modes.tenants : undefined);
  const users = dashboardModeSchema.safeParse('users' in modes ? modes.users : undefined);
  const licenses = dashboardModeSchema.safeParse('licenses' in modes ? modes.licenses : undefined);
  return {
    months: months.success ? months.data : defaults.months,
    modes: {
      organizations: organizations.success ? organizations.data : 'all',
      tenants: tenants.success ? tenants.data : 'all',
      users: users.success ? users.data : 'all',
      licenses: licenses.success ? licenses.data : 'all',
    },
  };
}

export function patchDashboardPreferences(
  preferences: DashboardPreferences,
  patch: DashboardPreferencesPatch,
): DashboardPreferences {
  return {
    months: patch.months ?? preferences.months,
    modes: {
      organizations: patch.modes?.organizations ?? preferences.modes.organizations,
      tenants: patch.modes?.tenants ?? preferences.modes.tenants,
      users: patch.modes?.users ?? preferences.modes.users,
      licenses: patch.modes?.licenses ?? preferences.modes.licenses,
    },
  };
}

export function getStoredDashboardPreferences(stored: unknown): StoredDashboardPreferences | undefined {
  if (!stored || typeof stored !== 'object' || !('userId' in stored) || typeof stored.userId !== 'string') {
    return undefined;
  }
  // The cookie stores one account, never an accumulating map of account preferences.
  if (!stored.userId || stored.userId.length > 128) return undefined;
  return { userId: stored.userId, ...getDashboardPreferences(stored, stored.userId) };
}
