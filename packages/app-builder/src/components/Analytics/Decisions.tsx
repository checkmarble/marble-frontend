import { type DecisionsFilter, type RangeId } from '@app-builder/models/analytics';
import { type ComputedDatum, ResponsiveBar } from '@nivo/bar';
import { format, startOfMonth, startOfWeek } from 'date-fns';
import { useMemo, useState } from 'react';
import { ButtonV2 } from 'ui-design-system';

export type DateRange = {
  start: string;
  end: string;
};
export type DecisionsPerOutcome = {
  rangeId: RangeId;
  date: string;
  approve: number;
  decline: number;
  review: number;
  blockAndReview: number;
  total?: number;
};

interface DecisionsProps {
  decisionsOutcomesPerDay: {
    ratio: DecisionsPerOutcome[];
    absolute: DecisionsPerOutcome[];
  };
  decisions: DecisionsFilter;
  setDecisions: (decisions: DecisionsFilter) => void;
}

export function Decisions({ decisionsOutcomesPerDay, decisions, setDecisions }: DecisionsProps) {
  // Decision filter default values
  const defaultDecisions: DecisionsFilter = new Map([
    ['decline', true],
    ['blockAndReview', true],
    ['review', true],
    ['approve', false],
  ]);
  const [decisionsState, setDecisionsState] = useState<DecisionsFilter>(defaultDecisions);
  const [percentage, setPercentage] = useState(true);
  const [groupDate, setGroupDate] = useState<'day' | 'week' | 'month'>('day');

  // TODO: Add a guard to check if the decisionsOutcomesPerDay is not empty
  if (decisionsOutcomesPerDay.absolute.length === 0) {
    return null;
  }

  // Use the decisions prop if provided, otherwise use internal state
  const currentDecisions = decisions || decisionsState;
  const currentSetDecisions = setDecisions || setDecisionsState;
  const TICK_VALUES = 5;
  // Return the first and last day of the period and numberOfValues days in between reparted in the period
  const getGridXValues = (values: DecisionsPerOutcome[]): string[] => {
    const nbValues = values.length;
    return nbValues <= TICK_VALUES
      ? values.map((item) => item.date)
      : values
          .filter(
            (_item, index) =>
              index === 0 ||
              index === nbValues - 1 ||
              index % Math.floor(nbValues / TICK_VALUES) === 0,
          )
          .map((item) => item.date);
  };

  interface GroupedData {
    values: DecisionsPerOutcome[];
    gridXValues: string[];
  }

  // Group data by day, week, or month based on groupDate state
  const groupedData = useMemo((): GroupedData => {
    if (groupDate === 'day') {
      const dataToGroup = percentage
        ? decisionsOutcomesPerDay.ratio
        : decisionsOutcomesPerDay.absolute;
      return {
        values: dataToGroup,
        gridXValues: getGridXValues(dataToGroup),
      };
    }

    const grouped = new Map<string, DecisionsPerOutcome>();

    // Always group by absolute values first to calculate correct totals
    decisionsOutcomesPerDay.absolute.forEach((item) => {
      const groupKey = format(
        groupDate === 'week'
          ? startOfWeek(new Date(item.date), { weekStartsOn: 1 })
          : startOfMonth(new Date(item.date)),
        'yyyy-MM-dd',
      );

      if (grouped.has(groupKey)) {
        const existing = grouped.get(groupKey)!;
        grouped.set(groupKey, {
          rangeId: item.rangeId,
          date: groupKey,
          approve: existing.approve + item.approve,
          decline: existing.decline + item.decline,
          review: existing.review + item.review,
          blockAndReview: existing.blockAndReview + item.blockAndReview,
          total: existing.total! + item.total!,
        });
      } else {
        grouped.set(groupKey, {
          rangeId: item.rangeId,
          date: groupKey,
          approve: item.approve,
          decline: item.decline,
          review: item.review,
          blockAndReview: item.blockAndReview,
          total: item.total,
        });
      }
    });

    // Convert to the format expected by the UI, calculating percentages if needed
    const groupedArray = Array.from(grouped.values()).map((item) => {
      if (percentage) {
        // Calculate percentages based on the grouped absolute totals
        const total = item.total!;
        return {
          rangeId: item.rangeId,
          date: item.date,
          approve: total ? (100 * item.approve) / total : 0,
          decline: total ? (100 * item.decline) / total : 0,
          review: total ? (100 * item.review) / total : 0,
          blockAndReview: total ? (100 * item.blockAndReview) / total : 0,
          total: total,
        };
      }

      // Return absolute values
      return {
        rangeId: item.rangeId,
        date: item.date,
        approve: item.approve,
        decline: item.decline,
        review: item.review,
        blockAndReview: item.blockAndReview,
        total: item.total,
      };
    });
    //   .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      values: groupedArray,
      gridXValues: getGridXValues(groupedArray),
    };
  }, [decisionsOutcomesPerDay, groupDate, percentage]);

  const getBarColors = (d: ComputedDatum<{ rangeId: RangeId }>) => {
    const id = String(d.id) as 'approve' | 'decline' | 'review' | 'blockAndReview';
    const colors = {
      approve: '#10b981', // green
      decline: '#ef4444', // red
      review: '#f59e0b', // amber
      blockAndReview: '#8b5cf6', // violet
    };
    return colors[id] ?? '#9ca3af';
  };

  return (
    <div className="flex w-3xl h-96 p-4 flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <span className="text-s">Count:</span>
        <div className="flex gap-1">
          <ButtonV2
            variant="secondary"
            onClick={() => {
              setPercentage(true);
              currentSetDecisions(
                new Map([
                  ['decline', true],
                  ['blockAndReview', true],
                  ['review', true],
                  ['approve', true],
                ]),
              );
            }}
            className={percentage ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
          >
            %
          </ButtonV2>
          <ButtonV2
            variant="secondary"
            onClick={() => setPercentage(false)}
            className={!percentage ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
          >
            #
          </ButtonV2>
        </div>
      </div>
      <div className="relative flex-1 w-full">
        <ResponsiveBar
          data={groupedData.values}
          indexBy="date"
          enableLabel={false}
          keys={
            percentage
              ? ['decline', 'blockAndReview', 'review', 'approve']
              : Array.from(currentDecisions)
                  .filter(([_, value]) => value)
                  .map(([key]) => key)
          }
          padding={0.5}
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          colors={getBarColors}
          defs={[
            {
              id: 'compareOpacity',
              type: 'linearGradient',
              colors: [
                { offset: 0, color: 'inherit', opacity: 0.5 },
                { offset: 100, color: 'inherit', opacity: 0.5 },
              ],
            },
          ]}
          fill={[
            {
              match: (n) => n.data.data.rangeId === 'compare',
              id: 'compareOpacity',
            },
          ]}
          axisLeft={{ legend: 'outcome (indexBy)', legendOffset: -70 }}
          axisBottom={{
            tickValues: groupedData.gridXValues,
            format: (value: string) => {
              // Convert the ISO string to a Date object and format it
              const date = new Date(value);
              return date.toLocaleDateString('fr-FR', {
                month: 'short',
                day: 'numeric',
              });
            },
          }}
        />
        <div className="relative bottom-2 right-2 flex gap-2">
          <ButtonV2
            variant="secondary"
            mode="normal"
            onClick={() => setGroupDate('day')}
            className={groupDate === 'day' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
          >
            Day
          </ButtonV2>
          <ButtonV2
            variant="secondary"
            mode="normal"
            onClick={() => setGroupDate('week')}
            className={groupDate === 'week' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
          >
            Week
          </ButtonV2>
          <ButtonV2
            variant="secondary"
            mode="normal"
            onClick={() => setGroupDate('month')}
            className={groupDate === 'month' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
          >
            Month
          </ButtonV2>
        </div>
      </div>
    </div>
  );
}
