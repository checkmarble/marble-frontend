import { z } from 'zod/v4';

export const DASHBOARD_PERIODS = [1, 3, 6, 12] as const;
export const DASHBOARD_ENTITIES = ['organizations', 'tenants', 'users', 'licenses'] as const;

export type DashboardMonths = (typeof DASHBOARD_PERIODS)[number];
export type DashboardEntity = (typeof DASHBOARD_ENTITIES)[number];

export const dashboardMonthsSchema = z.literal(DASHBOARD_PERIODS);
export const dashboardEntitySchema = z.enum(DASHBOARD_ENTITIES);

export const dashboardPreferencesPatchSchema = z
  .object({
    months: dashboardMonthsSchema.optional(),
    indicator: dashboardEntitySchema.optional(),
  })
  .strict();

export type DashboardPreferencesPatch = z.infer<typeof dashboardPreferencesPatchSchema>;
