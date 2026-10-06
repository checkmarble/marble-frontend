import { z } from 'zod/v4';

export const DASHBOARD_PERIODS = [1, 3, 6, 12] as const;

export type DashboardMonths = (typeof DASHBOARD_PERIODS)[number];
export type DashboardEntity = 'organizations' | 'tenants' | 'users' | 'licenses';
export type DashboardMode = 'all' | 'new';

export const dashboardMonthsSchema = z.literal(DASHBOARD_PERIODS);
export const dashboardModeSchema = z.enum(['all', 'new']);

export const dashboardPreferencesPatchSchema = z
  .object({
    months: dashboardMonthsSchema.optional(),
    modes: z
      .object({
        organizations: dashboardModeSchema.optional(),
        tenants: dashboardModeSchema.optional(),
        users: dashboardModeSchema.optional(),
        licenses: dashboardModeSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type DashboardPreferencesPatch = z.infer<typeof dashboardPreferencesPatchSchema>;
