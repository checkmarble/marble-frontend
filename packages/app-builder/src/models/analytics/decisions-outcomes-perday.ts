import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  getISODay,
  getISOWeek,
  getMonth,
  isBefore,
  isFirstDayOfMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { type DecisionOutcomesPerDayResponseDto } from 'marble-api';
import z from 'zod';

export type RangeId = 'base' | 'compare';

export interface DecisionOutcomesPerDayEntity extends DecisionOutcomesPerDayResponseDto {
  rangeId: RangeId;
}

export type LimitDate = {
  date: string;
  rangeId: RangeId;
};

export interface DecisionOutcomes {
  rangeId: RangeId;
  date: string;
  approve: number;
  blockAndReview: number;
  decline: number;
  review: number;
}

export interface DecisionOutcomesAbsolute extends DecisionOutcomes {
  total?: number;
}

export interface DecisionOutcomesGroup {
  absolute: DecisionOutcomesAbsolute[];
  ratio: DecisionOutcomes[];
}

export interface DecisionOutcomesPerPeriod {
  daily: {
    data: DecisionOutcomesGroup;
    gridXValues: string[];
  } | null;
  weekly: {
    data: DecisionOutcomesGroup;
    gridXValues: string[];
  };
  monthly: {
    data: DecisionOutcomesGroup;
    gridXValues: string[];
  };
  metadata: {
    start: string;
    end: string;
    totalDecisions: number;
  };
}

//TODO group by week and month server side

// export const triggerFilter = z.object({
//   field: z.uuidv4(),
//   op: z.enum(['=', '!=', '>', '>=', '<', '<=', 'in']),
//   values: z.array(z.union([z.string(), z.number(), z.boolean()])),
// });

export const triggerFilter = z.object({
  name: z.string(),
  op: z.enum(['=', '!=', '>', '>=', '<', '<=', 'in']),
  value: z.array(z.union([z.string(), z.number(), z.boolean()])),
  unavailable: z.boolean(),
});

export const mergeDateRanges = (dateRanges: DecisionOutcomesPerDayResponseDto[][]): DecisionOutcomesPerDayEntity[] =>
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
  start: LimitDate,
  end: LimitDate,
): DecisionOutcomesPerDayEntity[] => {
  if (data.length === 0) {
    return [];
  }

  const zeroActivityDay = (
    rangeId: RangeId,
  ): Pick<DecisionOutcomesPerDayEntity, 'approve' | 'block_and_review' | 'decline' | 'review' | 'rangeId'> => ({
    approve: 0,
    block_and_review: 0,
    decline: 0,
    review: 0,
    rangeId,
  });

  if (data[0]!.date !== start.date) {
    data.unshift({
      ...start,
      ...zeroActivityDay(start.rangeId),
    });
  }

  if (data[data.length - 1]!.date !== end.date) {
    data.push({
      ...end,
      ...zeroActivityDay(end.rangeId),
    });
  }

  return data.reduce((acc: DecisionOutcomesPerDayEntity[], current, index, array) => {
    acc.push(current);

    const nextDate = array[index + 1]?.date;
    if (!nextDate) return acc;

    const difference = differenceInDays(nextDate, current.date);
    if (difference === 1) return acc;

    for (let i = 1; i < difference; i++) {
      const date = addDays(current.date, i);
      acc.push({
        date: date.toISOString(),
        ...zeroActivityDay(current.rangeId),
      });
    }
    return acc;
  }, []);
};

const MAX_TICKS = 12;
const limitTicks = (data: DecisionOutcomesAbsolute[]): DecisionOutcomesAbsolute[] =>
  data.filter((_, i, arr) => arr.length <= MAX_TICKS || i % Math.round((arr.length - 1) / (MAX_TICKS - 1)) === 0);
const getGridXValues = (
  data: DecisionOutcomesAbsolute[],
  start: Date,
  end: Date,
  mode: 'day' | 'week' | 'month',
): string[] => {
  if (mode === 'day') {
    if (isBefore(end, addWeeks(start, 2))) {
      // Less than 2 weeks
      // Return first and last day, plus every 3 days
      return data
        .filter((_day, index) => index === 0 || index === data.length - 1 || index % 3 === 0)
        .map((v) => v.date);
    }

    if (isBefore(end, addMonths(start, 3))) {
      // Less than 3 months
      // Return first and last day, plus every mondays except if within 3 days of limits
      return data
        .filter((day, index) => {
          if (index === 0 || index === data.length - 1) return true;
          if (getISODay(day.date) !== 1) return false;
          return differenceInDays(day.date, start) > 2 && differenceInDays(end, day.date) > 2;
        })
        .map((v) => v.date);
    }

    // 3 months or more, (but not more than 6 months, because locked on frontend)
    // Return first and last day, plus 1st of every month
    return data
      .filter((day, index) => {
        if (index === 0 || index === data.length - 1) return true;
        if (!isFirstDayOfMonth(day.date)) return false;
        return differenceInDays(day.date, start) > 2 && differenceInDays(end, day.date) > 2;
      })
      .map((v) => v.date);
  }

  if (mode === 'week') {
    return limitTicks(data).map((v) => startOfWeek(v.date, { weekStartsOn: 1 }).toISOString());
  }
  // mode === 'month'
  return limitTicks(data).map((v) => startOfMonth(v.date).toISOString());
};

const getRatio = (item: DecisionOutcomesAbsolute): DecisionOutcomes => ({
  ...item,
  approve: item.total ? (100 * item.approve) / item.total : 0,
  blockAndReview: item.total ? (100 * item.blockAndReview) / item.total : 0,
  decline: item.total ? (100 * item.decline) / item.total : 0,
  review: item.total ? (100 * item.review) / item.total : 0,
});

export const adaptDecisionOutcomesPerDay = (val: DecisionOutcomesPerDayEntity[]): DecisionOutcomesPerPeriod => {
  // if (!val) {
  //   return null;
  // }
  const start = new Date(val[0]!.date);
  const end = new Date(val[val.length - 1]!.date);

  const total = val.reduce((acc, v) => acc + v.approve + v.block_and_review + v.decline + v.review, 0);
  const absoluteDailyData: DecisionOutcomesAbsolute[] = val.map((v) => ({
    rangeId: v.rangeId,
    date: v.date,
    approve: v.approve,
    blockAndReview: v.block_and_review,
    decline: v.decline,
    review: v.review,
    total: v.approve + v.block_and_review + v.decline + v.review,
  }));

  const absoluteCountsByWeek = new Map<number, DecisionOutcomesAbsolute>();
  const absoluteCountsByMonth = new Map<number, DecisionOutcomesAbsolute>();

  const appendToAbsoluteCounts = (
    map: Map<number, DecisionOutcomesAbsolute>,
    item: DecisionOutcomesAbsolute,
    mode: 'week' | 'month',
  ) => {
    const key = mode === 'week' ? getISOWeek(item.date) : getMonth(item.date);
    if (!map.has(key)) {
      return map.set(key, {
        ...item,
        date:
          mode === 'week'
            ? startOfWeek(item.date, { weekStartsOn: 1 }).toISOString()
            : startOfMonth(item.date).toISOString(),
      });
    }
    const current = map.get(key)!;
    map.set(key, {
      ...current,
      approve: current.approve + item.approve,
      blockAndReview: current.blockAndReview + item.blockAndReview,
      decline: current.decline + item.decline,
      review: current.review + item.review,
      total: current.total! + item.total!,
    });
  };

  absoluteDailyData.forEach((item) => {
    appendToAbsoluteCounts(absoluteCountsByWeek, item, 'week');
    appendToAbsoluteCounts(absoluteCountsByMonth, item, 'month');
  });

  const absoluteCountsByWeekArray = Array.from(absoluteCountsByWeek.values());
  const absoluteCountsByMonthArray = Array.from(absoluteCountsByMonth.values());

  return {
    daily: {
      data: {
        absolute: absoluteDailyData,
        ratio: absoluteDailyData.map((item) => getRatio(item)),
      },
      gridXValues: getGridXValues(absoluteDailyData, start, end, 'day'),
    },
    weekly: {
      data: {
        absolute: absoluteCountsByWeekArray,
        ratio: absoluteCountsByWeekArray.map((item) => getRatio(item)),
      },
      gridXValues: getGridXValues(absoluteCountsByWeekArray, start, end, 'week'),
    },
    monthly: {
      data: {
        absolute: absoluteCountsByMonthArray,
        ratio: absoluteCountsByMonthArray.map((item) => getRatio(item)),
      },
      gridXValues: getGridXValues(absoluteCountsByMonthArray, start, end, 'month'),
    },
    metadata: {
      start: start.toISOString(),
      end: end.toISOString(),
      totalDecisions: total,
    },
  };
};
