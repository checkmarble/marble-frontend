import * as z from 'zod';

export const outcomeSchema = z.enum([
  'approve',
  'review',
  'block_and_review',
  'decline',
  'unknown',
]);

export type Outcome = z.infer<typeof outcomeSchema>;
