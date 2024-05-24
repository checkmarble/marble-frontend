import * as z from 'zod';

export const outcomeSchema = z.enum([
  'approve',
  'review',
  'decline',
  'null',
  'unknown',
]);

export type Outcome = z.infer<typeof outcomeSchema>;
