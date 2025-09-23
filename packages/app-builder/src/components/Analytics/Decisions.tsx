import { type DecisionsFilter, type RangeId } from '@app-builder/models/analytics';
import { type ComputedDatum, ResponsiveBar } from '@nivo/bar';
import { differenceInCalendarDays, format, startOfMonth, startOfWeek } from 'date-fns';
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
  range: DateRange;
  decisions: DecisionsFilter;
  setDecisions: (decisions: DecisionsFilter) => void;
}

export function Decisions({
  decisionsOutcomesPerDay,
  range,
  decisions,
  setDecisions,
}: DecisionsProps) {
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

  // Use the decisions prop if provided, otherwise use internal state
  const currentDecisions = decisions || decisionsState;
  const currentSetDecisions = setDecisions || setDecisionsState;

  // Group data by day, week, or month based on groupDate state
  const groupedData = useMemo(() => {
    if (groupDate === 'day') {
      return decisionsOutcomesPerDay;
    }

    const dataToGroup = percentage
      ? decisionsOutcomesPerDay.ratio
      : decisionsOutcomesPerDay.absolute;
    const grouped = new Map<string, DecisionsPerOutcome>();

    dataToGroup.forEach((item) => {
      const date = new Date(item.date);
      let groupKey: string;

      if (groupDate === 'week') {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
        groupKey = format(weekStart, 'yyyy-MM-dd');
      } else if (groupDate === 'month') {
        const monthStart = startOfMonth(date);
        groupKey = format(monthStart, 'yyyy-MM-dd');
      } else {
        groupKey = format(date, 'yyyy-MM-dd');
      }

      if (grouped.has(groupKey)) {
        const existing = grouped.get(groupKey)!;
        grouped.set(groupKey, {
          rangeId: item.rangeId, // Preserve the rangeId
          date: groupKey,
          approve: existing.approve + item.approve,
          decline: existing.decline + item.decline,
          review: existing.review + item.review,
          blockAndReview: existing.blockAndReview + item.blockAndReview,
          total: existing.total ? existing.total! + (item.total || 0) : item.total || 0,
        });
      } else {
        grouped.set(groupKey, {
          rangeId: item.rangeId, // Preserve the rangeId
          date: groupKey,
          approve: item.approve,
          decline: item.decline,
          review: item.review,
          blockAndReview: item.blockAndReview,
          total: item.total,
        });
      }
    });

    const groupedArray = Array.from(grouped.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return {
      ratio: groupedArray,
      absolute: groupedArray,
    };
  }, [decisionsOutcomesPerDay, groupDate, percentage]);

  // Return the first and last day of the period and numberOfValues days in between reparted in the period
  const getGridXValues = (numberOfValues: number): string[] => {
    if (!range?.start || !range?.end) return [];
    const days = differenceInCalendarDays(new Date(range.end), new Date(range.start));
    const daysInBetween = days / numberOfValues;
    const gridXValues: string[] = [];
    const currentDate = new Date(range.start);
    const endDate = new Date(range.end);
    while (currentDate <= endDate) {
      gridXValues.push(currentDate.toISOString());
      currentDate.setDate(currentDate.getDate() + daysInBetween);
    }
    return gridXValues;
  };

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
          data={percentage ? groupedData.ratio : groupedData.absolute}
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
            truncateTickAt: 10,
            tickValues: getGridXValues(5),
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
        <div className="flex bottom-2 gap-2" style={{ right: '130px' }}>
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
