import { add } from 'date-fns/add';
import { Temporal } from 'temporal-polyfill';
import * as z from 'zod/v4';

export const dateRangeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('static'),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
  }),
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
]);

export type DateRangeFilter = z.infer<typeof dateRangeSchema>;

/** The `startDate`/`endDate` bounds the list endpoints take, a dynamic range counting back from now. */
export function resolveDateRange(dateRange: DateRangeFilter | undefined): { startDate?: string; endDate?: string } {
  if (dateRange?.type === 'static') return { startDate: dateRange.startDate, endDate: dateRange.endDate };
  if (dateRange?.type === 'dynamic') {
    // TODO(timezone): until we get the user's timezone, this is the server's.
    return { startDate: add(new Date(), Temporal.Duration.from(dateRange.fromNow)).toISOString() };
  }
  return {};
}

export type DateRangeFilterForm =
  | {
      type: 'static';
      startDate: string;
      endDate: string;
    }
  | {
      type: 'dynamic';
      fromNow: string;
    }
  | null;
