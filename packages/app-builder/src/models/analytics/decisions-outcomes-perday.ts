import { DecisionOutcomesPerDayQueryDto, type DecisionOutcomesPerDayResponseDto } from 'marble-api';
import z from 'zod';

export const rangeId = z.enum(['base', 'compare']);
export type RangeId = z.infer<typeof rangeId>;
export interface DecisionOutcomesPerDayEntity extends DecisionOutcomesPerDayResponseDto {
  rangeId: RangeId;
}

export const decisionOutcomesPerDay = z.object({
  absolute: z.array(
    z.object({
      rangeId: rangeId,
      date: z.iso.datetime(),
      approve: z.number(),
      blockAndReview: z.number(),
      decline: z.number(),
      review: z.number(),
      total: z.number(),
    }),
  ),
  ratio: z.array(
    z.object({
      rangeId: rangeId,
      date: z.iso.datetime(),
      approve: z.number(),
      blockAndReview: z.number(),
      decline: z.number(),
      review: z.number(),
    }),
  ),
});

export const triggerFilter = z.object({
  field: z.uuidv4(),
  op: z.enum(['=', '!=', '>', '>=', '<', '<=']),
  values: z.array(z.string()),
});

export const decisionOutcomesPerDayQuery = z.object({
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

export type Entity = z.infer<typeof decisionOutcomesPerDay>;
export type DecisionOutcomesPerDayQuery = z.infer<typeof decisionOutcomesPerDayQuery>;
export type DecisionOutcomesPerDay = z.infer<typeof decisionOutcomesPerDay>;

function toUtcDayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const d = `${date.getUTCDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// TODO: Helper function to be moved to a utils file
function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function findMissingDays(
  data: DecisionOutcomesPerDayEntity[],
  start: Date,
  end: Date,
): string[] {
  const startDay = startOfUtcDay(start);
  const endDay = startOfUtcDay(end);

  const existing = new Set(data.map((d) => toUtcDayKey(new Date(d.date))));

  const missing: string[] = [];
  for (let t = startDay.getTime(); t <= endDay.getTime(); t += 24 * 60 * 60 * 1000) {
    const key = toUtcDayKey(new Date(t));
    if (!existing.has(key)) missing.push(key);
  }
  return missing;
}

export const mergeDateRanges = (
  dateRanges: DecisionOutcomesPerDayResponseDto[][],
): DecisionOutcomesPerDayEntity[] =>
  dateRanges
    .flatMap((range, index) =>
      range.map(
        (item): DecisionOutcomesPerDayEntity => ({
          ...item,
          rangeId: (index === 0 ? 'base' : 'compare') as RangeId,
        }),
      ),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Fill the days without data with zero values between [start, end]
export const fillMissingDays = (
  data: DecisionOutcomesPerDayEntity[],
  start: string,
  end: string,
): DecisionOutcomesPerDayEntity[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const missing = findMissingDays(data, startDate, endDate);
  const filled = [
    ...data,
    ...missing.map((key) => ({
      rangeId: 'base' as RangeId,
      date: `${key}T00:00:00.000Z`,
      approve: 0,
      block_and_review: 0,
      decline: 0,
      review: 0,
    })),
  ];
  filled.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return filled;
};

export const transformDecisionOutcomesPerDayQuery = decisionOutcomesPerDayQuery.transform(
  (val): DecisionOutcomesPerDayQueryDto[] => {
    return [
      {
        start: val.dateRange.start,
        end: val.dateRange.end,
        scenario_id: val.scenarioId,
        scenario_versions: val.scenarioVersion ? [val.scenarioVersion] : [],
        trigger: val.trigger,
      },
      ...(val.compareDateRange
        ? [
            {
              start: val.compareDateRange.start,
              end: val.compareDateRange.end,
              scenario_id: val.scenarioId,
              scenario_versions: val.scenarioVersion ? [val.scenarioVersion] : [],
              trigger: val.trigger,
            },
          ]
        : []),
    ];
  },
);

export const adaptDecisionOutcomesPerDay = z.array(z.any()).transform(
  (val: DecisionOutcomesPerDayEntity[]): DecisionOutcomesPerDay => ({
    absolute: val.map((v) => ({
      rangeId: v.rangeId,
      date: v.date,
      approve: v.approve,
      blockAndReview: v.block_and_review,
      decline: v.decline,
      review: v.review,
      total: v.approve + v.block_and_review + v.decline + v.review,
    })),
    ratio: val.map((v) => {
      const total = v.approve + v.block_and_review + v.decline + v.review;
      return {
        rangeId: v.rangeId,
        date: v.date,
        approve: total ? (100 * v.approve) / total : 0,
        blockAndReview: total ? (100 * v.block_and_review) / total : 0,
        decline: total ? (100 * v.decline) / total : 0,
        review: total ? (100 * v.review) / total : 0,
      };
    }),
  }),
);
