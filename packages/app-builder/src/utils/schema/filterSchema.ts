import { Temporal } from 'temporal-polyfill';
import * as z from 'zod/v4';

export const dateRangeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('static'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
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
