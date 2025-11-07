import { subDays, subMonths } from 'date-fns';
import { AnalyticsQueryDto, FieldFilterDto } from 'marble-api';
import z from 'zod';
import { triggerFilter } from './decisions-outcomes-perday';

export * from './available-filters';
export * from './decisions-outcomes-perday';
export * from './decisions-score-distribution';
export * as legacyAnalytics from './legacy-analytics';
export * from './rule-vs-decision-outcome';
export * from './screening-hit';

export type Outcome = 'approve' | 'review' | 'blockAndReview' | 'decline';
export type DecisionsFilter = Map<Outcome, boolean>;

export const outcomeColors: Record<Outcome, string> = {
  approve: '#89D4AE',
  review: '#FBDD82',
  blockAndReview: '#FFECE6',
  decline: '#E99B8E',
};

const iso = z.iso.datetime();

const staticDateRangeSchema = z.object({
  type: z.literal('static'),
  startDate: iso,
  endDate: iso,
});

export type StaticDateRange = z.infer<typeof staticDateRangeSchema>;

const dynamicDateRangeSchema = z.object({
  type: z.literal('dynamic'),
  fromNow: z.string().min(2),
});

export const dateRangeFilterSchema = z.union([staticDateRangeSchema, dynamicDateRangeSchema]);

export type DateRangeFilter = z.infer<typeof dateRangeFilterSchema>;

export type DateRange = {
  start: string;
  end: string;
};

const transformDateRangeToStatic = dateRangeFilterSchema.transform((val: DateRangeFilter): DateRange => {
  if (val.type === 'static')
    return {
      start: val.startDate,
      end: val.endDate,
    };

  const now = new Date();
  const m = /-?P-?(\d+)([MD])/i.exec(val.fromNow);
  const amount = m && m[1] ? Number(m[1]) : 1;
  const unit = m && m[2] ? m[2].toUpperCase() : 'M';
  const startDate = unit === 'D' ? subDays(now, amount) : subMonths(now, amount);
  return { start: new Date(startDate).toISOString(), end: new Date(now).toISOString() };
});

export function getIsoBoundsFromDateRanges(ranges: DateRangeFilter[]): DateRange {
  if (!ranges.length) return { start: '', end: '' };

  const staticRanges = ranges.map((r) => transformDateRangeToStatic.parse(r));

  const earliestStart = new Date(Math.min(...staticRanges.map((r) => new Date(r.start).getTime()))).toISOString();

  const latestEnd = new Date(Math.max(...staticRanges.map((r) => new Date(r.end).getTime()))).toISOString();

  return { start: earliestStart, end: latestEnd };
}

export const analyticsFiltersQuery = z.object({
  range: dateRangeFilterSchema,
  compareRange: dateRangeFilterSchema.optional(),
  scenarioVersion: z.number().optional(),
  trigger: z.array(triggerFilter).optional(),
});

export type AnalyticsFiltersQuery = z.infer<typeof analyticsFiltersQuery>;

export const analyticsQuery = analyticsFiltersQuery.extend({
  scenarioId: z.uuidv4(),
});

export const transformTriggersFiltersToFieldsFilters = (filters: AnalyticsFiltersQuery['trigger']): FieldFilterDto[] =>
  filters
    ?.filter((f) => !f.unavailable)
    .map((f) => ({
      source: 'trigger_object',
      field: f.name,
      op: f.op,
      values: f.value,
    })) ?? [];

// export const TransformAnalyticsQueryRequest = analyticsQuery.transform((val): AnalyticsQueryDto[] => {

export type AnalyticsQuery = z.infer<typeof analyticsQuery>;

export const transformAnalyticsQuery = analyticsQuery.transform((val): AnalyticsQueryDto[] => {
  return [
    {
      ...transformDateRangeToStatic.parse(val.range),
      scenario_id: val.scenarioId,
      scenario_versions: val.scenarioVersion ? [val.scenarioVersion] : [],
      fields: transformTriggersFiltersToFieldsFilters(val.trigger),
    },
    ...(val.compareRange
      ? [
          {
            ...transformDateRangeToStatic.parse(val.compareRange),
            scenario_id: val.scenarioId,
            scenario_versions: val.scenarioVersion ? [val.scenarioVersion] : [],
            fields: transformTriggersFiltersToFieldsFilters(val.trigger),
          },
        ]
      : []),
  ];
});
