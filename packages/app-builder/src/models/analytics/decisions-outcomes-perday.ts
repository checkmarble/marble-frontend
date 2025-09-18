import { DecisionOutcomesPerDayQueryDto, type DecisionOutcomesPerDayResponseDto } from 'marble-api';
import z from 'zod';

export const decisionOutcomesPerDay = z.object({
  absolute: z.array(
    z.object({
      date: z.date(),
      approve: z.number(),
      blockAndReview: z.number(),
      decline: z.number(),
      review: z.number(),
      total: z.number(),
    }),
  ),
  ratio: z.array(
    z.object({
      date: z.date(),
      approve: z.number(),
      blockAndReview: z.number(),
      decline: z.number(),
      review: z.number(),
    }),
  ),
});

export const decisionOutcomesPerDayTrigger = z.object({
  field: z.uuidv4(),
  op: z.enum(['=', '!=', '>', '>=', '<', '<=']),
  values: z.array(z.string()),
});

export const decisionOutcomesPerDayQuery = z.object({
  start: z.date(),
  end: z.date(),
  scenarioId: z.uuidv4(),
  scenarioVersion: z.number().optional(),
  trigger: z.array(decisionOutcomesPerDayTrigger),
});

export type DecisionOutcomesPerDay = z.infer<typeof decisionOutcomesPerDay>;
export type DecisionOutcomesPerDayQuery = z.infer<typeof decisionOutcomesPerDayQuery>;

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
  data: DecisionOutcomesPerDayResponseDto[],
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

// Fill the days without data with zero values between [start, end]
export function fillMissingDays(
  data: DecisionOutcomesPerDayResponseDto[],
  start: Date,
  end: Date,
): DecisionOutcomesPerDayResponseDto[] {
  const missing = findMissingDays(data, start, end);
  const filled = [
    ...data,
    ...missing.map((key) => ({
      date: `${key}T00:00:00.000Z`,
      approve: 0,
      block_and_review: 0,
      decline: 0,
      review: 0,
    })),
  ];
  filled.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return filled;
}

export const transformDecisionOutcomesPerDayQuery = decisionOutcomesPerDayQuery.transform(
  (val): DecisionOutcomesPerDayQueryDto => {
    return {
      start: val.start.toISOString(),
      end: val.end.toISOString(),
      scenario_id: val.scenarioId,
      scenario_versions: val.scenarioVersion ? [val.scenarioVersion] : undefined,
      trigger: val.trigger,
    };
  },
);

export const adaptDecisionOutcomesPerDay = z.array(z.any()).transform(
  (val: DecisionOutcomesPerDayResponseDto[]): DecisionOutcomesPerDay => ({
    absolute: val.map((v) => ({
      date: new Date(v.date),
      approve: v.approve,
      blockAndReview: v.block_and_review,
      decline: v.decline,
      review: v.review,
      total: v.approve + v.block_and_review + v.decline + v.review,
    })),
    ratio: val.map((v) => {
      const total = v.approve + v.block_and_review + v.decline + v.review;
      return {
        date: new Date(v.date),
        approve: total ? (100 * v.approve) / total : 0,
        blockAndReview: total ? (100 * v.block_and_review) / total : 0,
        decline: total ? (100 * v.decline) / total : 0,
        review: total ? (100 * v.review) / total : 0,
      };
    }),
  }),
);
