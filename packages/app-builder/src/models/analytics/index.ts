import { startOfDay } from 'date-fns';
import { AnalyticsQueryDto } from 'marble-api';
import z from 'zod';
import { triggerFilter } from './decisions-outcomes-perday';

export * from './available-filters';
export * from './decisions-outcomes-perday';
export * as legacyAnalytics from './legacy-analytics';

export type Outcome = 'approve' | 'review' | 'blockAndReview' | 'decline';
export type DecisionsFilter = Map<Outcome, boolean>;

export const outcomeColors: Record<Outcome, string> = {
  approve: '#89D4AE',
  review: '#FBDD82',
  blockAndReview: '#FFECE6',
  decline: '#E99B8E',
};

export const analyticsQuery = z.object({
  dateRange: z.object({
    start: z.iso.datetime(),
    end: z.iso.datetime(),
  }),
  compareDateRange: z
    .object({
      start: z.iso.datetime(),
      end: z.iso.datetime(),
    })
    .optional(),
  scenarioId: z.uuidv4(),
  scenarioVersion: z.number().optional(),
  trigger: z.array(triggerFilter),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuery>;

export const transformAnalyticsQuery = analyticsQuery.transform((val): AnalyticsQueryDto[] => {
  return [
    {
      start: startOfDay(val.dateRange.start).toISOString(),
      end: startOfDay(val.dateRange.end).toISOString(),
      scenario_id: val.scenarioId,
      scenario_versions: val.scenarioVersion ? [val.scenarioVersion] : [],
      trigger: val.trigger,
    },
    ...(val.compareDateRange
      ? [
          {
            start: startOfDay(val.compareDateRange.start).toISOString(),
            end: startOfDay(val.compareDateRange.end).toISOString(),
            scenario_id: val.scenarioId,
            scenario_versions: val.scenarioVersion ? [val.scenarioVersion] : [],
            trigger: val.trigger,
          },
        ]
      : []),
  ];
});
