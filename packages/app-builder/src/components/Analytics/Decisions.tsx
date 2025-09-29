import {
  DecisionOutcomesPerPeriod,
  type DecisionsFilter,
  outcomeColors,
  type RangeId,
} from '@app-builder/models/analytics';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type ComputedDatum, ResponsiveBar } from '@nivo/bar';
import { getYear } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { OutcomeFilter } from './OutcomeFilter';

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
  data: DecisionOutcomesPerPeriod | null;
  scenarioVersions: { version: number; createdAt: string }[];
}

export function Decisions({ data, scenarioVersions }: DecisionsProps) {
  const language = useFormatLanguage();

  // Decision filter default values
  const defaultDecisions: DecisionsFilter = new Map([
    ['decline', true],
    ['blockAndReview', true],
    ['review', true],
    ['approve', true],
  ]);
  const [decisions, setDecisions] = useState<DecisionsFilter>(defaultDecisions);
  const [percentage, setPercentage] = useState(true);
  const [groupDate, setGroupDate] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const currentDataGroup = useMemo(() => data?.[groupDate], [data, groupDate]);

  useEffect(() => {
    if (!data?.metadata.totalDecisions) {
      return setGroupDate('daily');
    }
    if (!data?.daily && groupDate === 'daily') {
      return setGroupDate('weekly');
    }
  }, [data?.metadata.totalDecisions]);

  // for future use

  //   interface ScenarioVersionsXMarker {
  //     axis: 'x';
  //     legend: string;
  //     legendOrientation: 'horizontal';
  //     value: string;
  //     lineStyle: {
  //       stroke: string;
  //       strokeWidth: number;
  //     };
  //   }

  //   const getVersionsXValues = (
  //     values: DecisionsPerOutcome[],
  //     scenarioVersions: { version: number; createdAt: string }[],
  //   ): ScenarioVersionsXMarker[] => {
  //     // Find the closest date for each scenario version and override the scenario version creation date with the date of the closest date
  //     return scenarioVersions
  //       .map(({ version, createdAt }) => {
  //         const closestDate = values.find((value) => value.date >= createdAt);
  //         return !closestDate
  //           ? undefined
  //           : {
  //               axis: 'x' as const,
  //               value: closestDate.date,
  //               lineStyle: {
  //                 stroke: 'rgba(0, 0, 0, .35)',
  //                 strokeWidth: 2,
  //               },
  //               legend: `v${version}`,
  //               legendOrientation: 'horizontal' as const,
  //             };
  //       })
  //       .filter((v) => v !== undefined);
  //   };

  const getBarColors = (d: ComputedDatum<{ rangeId: RangeId }>) => {
    const id = String(d.id) as 'approve' | 'decline' | 'review' | 'blockAndReview';
    // const colors = {
    // approve: '#10b981',
    // decline: '#ef4444',
    // review: '#f59e0b',
    // blockAndReview: '#ffab73',
    // };
    return outcomeColors[id] ?? '#9ca3af';
  };

  //   if (!data) {
  //     return null;
  //   }
  return (
    <div className="bg-white border border-grey-90 rounded-lg p-4 shadow-sm">
      <div className="flex w-full h-[500px] flex-col items-start gap-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-s">Count:</span>
            <div className="flex gap-1">
              <ButtonV2
                variant="secondary"
                onClick={() => {
                  setPercentage(true);
                  setDecisions(
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
          <ButtonV2 variant="secondary" className="flex items-center gap-2" disabled={true}>
            <Icon icon="download" className="size-4" />
            Export
          </ButtonV2>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveBar
            data={
              percentage
                ? (currentDataGroup?.data.ratio ?? [])
                : (currentDataGroup?.data.absolute ?? [])
            }
            indexBy="date"
            enableLabel={false}
            keys={
              // percentage
              //   ? ['decline', 'blockAndReview', 'review', 'approve']
              //   :
              Array.from(decisions)
                .filter(([_, value]) => value)
                .map(([key]) => key)
            }
            padding={0.5}
            margin={{ top: 20, right: 0, bottom: 20, left: 60 }}
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
                match: (n) => n.data.data['rangeId'] === 'compare',
                id: 'compareOpacity',
              },
            ]}
            valueScale={
              !data?.metadata.totalDecisions ? { type: 'linear', min: 0, max: 1000 } : undefined
            }
            axisLeft={{
              legend: 'outcome (indexBy)',
              legendOffset: -70,
              tickValues: !data?.metadata.totalDecisions
                ? [0, 200, 400, 600, 800, 1000]
                : undefined,
            }}
            axisBottom={{
              tickValues: data?.metadata.totalDecisions
                ? currentDataGroup?.gridXValues
                : [data?.metadata.start, data?.metadata.end],
              format: (value: string) => {
                // Convert the ISO string to a Date object and format it
                const date = new Date(value);
                return date.toLocaleDateString(language, {
                  year:
                    getYear(data?.metadata.start!) !== getYear(data?.metadata.end!)
                      ? 'numeric'
                      : undefined,
                  month: 'short',
                  day: 'numeric',
                });
              },
            }}
            layout="vertical"
            motionConfig="stiff"

            //   markers={currentDataGroup?.scenarioVersionsXMarkers}
          />
        </div>
        <div className="flex w-full justify-end mt-2">
          <div className="flex gap-2">
            <ButtonV2
              disabled={!data?.daily || !data?.metadata.totalDecisions}
              variant="secondary"
              mode="normal"
              onClick={() => setGroupDate('daily')}
              className={
                groupDate === 'daily' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''
              }
            >
              Day
            </ButtonV2>
            <ButtonV2
              disabled={!data?.weekly || !data?.metadata.totalDecisions}
              variant="secondary"
              mode="normal"
              onClick={() => setGroupDate('weekly')}
              className={
                groupDate === 'weekly' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''
              }
            >
              Week
            </ButtonV2>
            <ButtonV2
              disabled={!data?.monthly || !data?.metadata.totalDecisions}
              variant="secondary"
              mode="normal"
              onClick={() => setGroupDate('monthly')}
              className={
                groupDate === 'monthly' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''
              }
            >
              Month
            </ButtonV2>
          </div>
        </div>
        <div className="flex w-full justify-center mt-4">
          <OutcomeFilter decisions={decisions} onChange={setDecisions} />
        </div>
      </div>
    </div>
  );
}
