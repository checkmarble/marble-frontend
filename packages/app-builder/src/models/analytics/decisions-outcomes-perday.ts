import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  getDate,
  getDay,
  getISOWeek,
  getMonth,
  isAfter,
  isBefore,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { DecisionOutcomesPerDayQueryDto, type DecisionOutcomesPerDayResponseDto } from 'marble-api';
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
}

//TODO group by week and month server side

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

export type DecisionOutcomesPerDayQuery = z.infer<typeof decisionOutcomesPerDayQuery>;

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
  start: LimitDate,
  end: LimitDate,
): DecisionOutcomesPerDayEntity[] => {
  if (data.length === 0) {
    return [];
  }

  const zeroActivityDay = (
    rangeId: RangeId,
  ): Pick<
    DecisionOutcomesPerDayEntity,
    'approve' | 'block_and_review' | 'decline' | 'review' | 'rangeId'
  > => ({
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

const getGridXValues = (
  data: DecisionOutcomesAbsolute[],
  start: Date,
  end: Date,
  mode: 'day' | 'week' | 'month',
): string[] => {
  if (mode === 'day') {
    if (isBefore(end, addWeeks(start, 2))) {
      // return mondays
      return data.filter((day) => getDay(day.date) === 1).map((v) => v.date);
    }

    if (isBefore(end, addMonths(start, 3))) {
      // return 1st and 15th of the month
      return data
        .filter((day) => getDate(day.date) === 1 || getDate(day.date) === 15)
        .map((v) => v.date);
    }

    // return 1st of the month
    return data.filter((day) => getDay(day.date) === 1).map((v) => v.date);
  }
  if (mode === 'week') {
    return data.map((v) => startOfWeek(v.date, { weekStartsOn: 1 }).toISOString());
  }
  return data.map((v) => startOfMonth(v.date).toISOString());
};

const getRatio = (item: DecisionOutcomesAbsolute): DecisionOutcomes => ({
  ...item,
  approve: item.total ? (100 * item.approve) / item.total : 0,
  blockAndReview: item.total ? (100 * item.blockAndReview) / item.total : 0,
  decline: item.total ? (100 * item.decline) / item.total : 0,
  review: item.total ? (100 * item.review) / item.total : 0,
});

export const adaptDecisionOutcomesPerDay = (
  val: DecisionOutcomesPerDayEntity[],
): DecisionOutcomesPerPeriod | null => {
  if (!val) {
    return null;
  }
  const start = new Date(val[0]!.date);
  const end = new Date(val[val.length - 1]!.date);

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

  return {
    daily: isAfter(end, addMonths(start, 6))
      ? null
      : {
          data: {
            absolute: absoluteDailyData,
            ratio: absoluteDailyData.map((item) => getRatio(item)),
          },
          gridXValues: getGridXValues(absoluteDailyData, start, end, 'day'),
        },
    weekly: {
      data: {
        absolute: Array.from(absoluteCountsByWeek.values()),
        ratio: Array.from(absoluteCountsByWeek.values()).map((item) => getRatio(item)),
      },
      gridXValues: getGridXValues(absoluteDailyData, start, end, 'week'),
    },
    monthly: {
      data: {
        absolute: Array.from(absoluteCountsByMonth.values()),
        ratio: Array.from(absoluteCountsByMonth.values()).map((item) => getRatio(item)),
      },
      gridXValues: getGridXValues(absoluteDailyData, start, end, 'month'),
    },
  };
};
