import { reviewStatuses } from '@app-builder/models/decision';
import { knownOutcomes } from '@app-builder/models/outcome';
import { dateRangeSchema } from '@app-builder/utils/schema/filterSchema';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { z } from 'zod/v4';

export const unboundedDateRange = { type: 'unbounded' } as const;
export const unboundedDateRangeSchema = z.object({ type: z.literal('unbounded') });
export const decisionDateRangeSchema = z.union([dateRangeSchema, unboundedDateRangeSchema]);

export function isUnboundedDateRange(value: unknown): value is typeof unboundedDateRange {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'unbounded';
}

export const decisionFiltersSchema = z.object({
  dateRange: decisionDateRangeSchema.optional(),
  hasCase: z.union([z.stringbool().optional(), z.boolean()]),
  outcomeAndReviewStatus: z
    .object({
      outcome: z.enum(knownOutcomes),
      reviewStatus: z.enum(reviewStatuses).optional(),
    })
    .optional(),
  pivotValue: z.string().optional(),
  scenarioId: protectArray(z.array(z.string())).optional(),
  scheduledExecutionId: protectArray(z.array(z.string().uuid())).optional(),
  caseInboxId: protectArray(z.array(z.string())).optional(),
  triggerObject: protectArray(z.array(z.string())).optional(),
  triggerObjectId: z.string().optional(),
});

export type DecisionFilters = z.infer<typeof decisionFiltersSchema>;
