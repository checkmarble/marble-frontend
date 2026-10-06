import {
  type DashboardEntity,
  type DashboardMonths,
  type DashboardPreferencesPatch,
  dashboardEntitySchema,
  dashboardMonthsSchema,
} from '@bo/schemas/dashboard';

export type DashboardPreferences = {
  months: DashboardMonths;
  indicator: DashboardEntity;
};
export type StoredDashboardPreferences = DashboardPreferences & { userId: string };

export function getDashboardPreferences(stored: unknown, userId: string | undefined): DashboardPreferences {
  const defaults: DashboardPreferences = { months: 6, indicator: 'organizations' };
  if (!userId || !stored || typeof stored !== 'object' || !('userId' in stored) || stored.userId !== userId) {
    return defaults;
  }

  const months = dashboardMonthsSchema.safeParse('months' in stored ? stored.months : undefined);
  const indicator = dashboardEntitySchema.safeParse('indicator' in stored ? stored.indicator : undefined);
  return {
    months: months.success ? months.data : defaults.months,
    indicator: indicator.success ? indicator.data : defaults.indicator,
  };
}

export function patchDashboardPreferences(
  preferences: DashboardPreferences,
  patch: DashboardPreferencesPatch,
): DashboardPreferences {
  return {
    months: patch.months ?? preferences.months,
    indicator: patch.indicator ?? preferences.indicator,
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
