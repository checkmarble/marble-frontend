import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';

const dateRangeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('dynamic'),
    fromNow: z.string().refine((value) => {
      try {
        Temporal.Duration.from(value);
        return true;
      } catch {
        return false;
      }
    }),
  }),
  z.object({
    type: z.literal('static'),
    startDate: z.string(),
    endDate: z.string(),
  }),
]);

export const auditEventsFiltersSchema = z.object({
  dateRange: dateRangeSchema.optional(),
  table: z.string().optional(),
  entityId: z.string().optional(),
});

export type AuditEventsFilters = z.infer<typeof auditEventsFiltersSchema>;

export const auditEventsFilterNames = ['dateRange', 'table', 'entityId'] as const;
export type AuditEventsFilterName = (typeof auditEventsFilterNames)[number];
