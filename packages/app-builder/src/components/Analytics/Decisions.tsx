import { Spinner } from '@app-builder/components/Spinner';
import { useResizeObserver } from '@app-builder/hooks/useResizeObserver';
import {
  type DecisionOutcomesAbsolute,
  DecisionOutcomesPerPeriod,
  type DecisionsFilter,
  type Outcome,
  type RangeId,
} from '@app-builder/models/analytics';
import { OUTCOME_COLORS } from '@app-builder/routes/_builder+/_analytics+/analytics.$scenarioId';
import { useFormatLanguage } from '@app-builder/utils/format';
import { type ComputedDatum, ResponsiveBar } from '@nivo/bar';
import { getWeek, getYear } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
  isLoading?: boolean;
}

export function Decisions({ data, scenarioVersions, isLoading = false }: DecisionsProps) {
  const { t } = useTranslation();
  const language = useFormatLanguage();

  const { ref: divRef, dimensions } = useResizeObserver<HTMLDivElement>({
    throttleMs: 16,
    observeHeight: false,
  });

  // Decision filter default values
  const defaultDecisions: DecisionsFilter = new Map([
    ['decline', true],
    ['blockAndReview', true],
    ['review', true],
    ['approve', true],
  ]);
  const [decisions, setDecisions] = useState<DecisionsFilter>(defaultDecisions);
  const [percentage, setPercentage] = useState(false);
  const [groupDate, setGroupDate] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isHovered, setIsHovered] = useState(false);

  const currentDataGroup = useMemo(() => data?.[groupDate], [data, groupDate]);

  // Sanitize data to ensure all values are valid numbers
  const sanitizedData = useMemo(() => {
    const sourceData = percentage ? (currentDataGroup?.data.ratio ?? []) : (currentDataGroup?.data.absolute ?? []);

    return sourceData.map((item) => {
      const sanitized: DecisionsPerOutcome = {
        ...item,
        approve: Number.isFinite(item.approve) ? item.approve : 0,
        decline: Number.isFinite(item.decline) ? item.decline : 0,
        review: Number.isFinite(item.review) ? item.review : 0,
        blockAndReview: Number.isFinite(item.blockAndReview) ? item.blockAndReview : 0,
      };

      // Only add total if it exists (absolute data has total, ratio doesn't)
      if ('total' in item && typeof item.total === 'number') {
        sanitized.total = Number.isFinite(item.total) ? item.total : 0;
      }

      return sanitized;
    });
  }, [percentage, currentDataGroup]);

  const isSameYear: boolean = getYear(data?.metadata.start!) === getYear(data?.metadata.end!);

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

  const getBarColors = (d: ComputedDatum<DecisionsPerOutcome>) => {
    const id = String(d.id) as 'approve' | 'decline' | 'review' | 'blockAndReview';
    return OUTCOME_COLORS[id] ?? '#9ca3af';
  };

  const getTootlipDateFormat = (date: string) => {
    const dateObj = new Date(date);
    switch (groupDate) {
      case 'monthly':
        return (
          <span className="capitalize">
            {dateObj.toLocaleDateString(language, {
              month: 'long',
              year: isSameYear ? undefined : 'numeric',
            })}
          </span>
        );
      case 'weekly':
        return (
          <Trans
            i18nKey="analytics:decisions.tooltip.weekly"
            values={{
              date: dateObj.toLocaleDateString(language, {
                day: 'numeric',
                month: 'short',
                year: isSameYear ? undefined : 'numeric',
              }),
              weekNumber: getWeek(dateObj),
            }}
            components={{
              Br: <br />,
            }}
          />
        );

      case 'daily':
        return (
          <Trans
            i18nKey="analytics:decisions.tooltip.daily"
            values={{
              date: dateObj.toLocaleDateString(language, {
                day: 'numeric',
                month: 'short',
                year: isSameYear ? undefined : 'numeric',
              }),
            }}
          />
        );
    }
  };

  const getOutcomeTranslationKey = (outcome: Outcome): string => {
    if (outcome === 'blockAndReview') {
      return 'decisions:outcome.block_and_review';
    }
    return `decisions:outcome.${outcome}`;
  };

  const getXTickValues = () => {
    if (!currentDataGroup?.gridXValues) {
      return [];
    }
    if (!data?.metadata.totalDecisions) {
      return [data?.metadata.start, data?.metadata.end];
    }

    if (dimensions.width < 400) {
      return currentDataGroup.gridXValues.filter((_, index) => index % 4 === 0);
    }
    if (dimensions.width < 800 && currentDataGroup.gridXValues.length >= 10) {
      return currentDataGroup?.gridXValues.filter((_, index) => index % 2 === 0);
    }
    return currentDataGroup?.gridXValues;
  };

  const handleExportCsv = () => {
    if (!currentDataGroup) return;
    const rows = currentDataGroup.data.absolute;
    if (!rows.length) return;

    const headers = ['date', 'rangeId', ...decisions.keys(), ['total']];

    const lines = rows.map((row) => {
      const base = [row.date, row.rangeId];
      type OutcomeValues = Pick<DecisionsPerOutcome, Outcome>;
      const outcomeValues = Array.from(decisions.entries()).map(([k]) => {
        const v = (row as OutcomeValues)[k];
        return String(v);
      });
      const maybeTotal = [String((row as DecisionOutcomesAbsolute).total ?? 0)];
      return [...base, ...outcomeValues, ...maybeTotal].join(',');
    });

    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8,' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decisions_${groupDate}_${percentage ? 'percentage' : 'absolute'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">{t('analytics:decisions.title')}</h2>
        <ButtonV2
          variant="secondary"
          className="flex items-center gap-v2-sm"
          disabled={
            isLoading ||
            !currentDataGroup ||
            (percentage
              ? (currentDataGroup.data.ratio?.length ?? 0) === 0
              : (currentDataGroup.data.absolute?.length ?? 0) === 0)
          }
          onClick={handleExportCsv}
        >
          <Icon icon="download" className="size-4" />
          {t('analytics:decisions.export.button')}
        </ButtonV2>
      </div>

      <div ref={divRef} className="bg-white border border-grey-90 rounded-lg p-v2-md shadow-sm mt-v2-sm relative">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-98/80 hover:bg-grey-95/80">
            <Spinner className="size-6" />
          </div>
        ) : null}
        <div className="flex w-full h-[500px] flex-col items-start gap-v2-md">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-v2-sm">
              <span className="text-s">Count:</span>
              <div className="flex gap-v2-sm">
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
          </div>
          <div className="flex-1 w-full">
            <ResponsiveBar<DecisionsPerOutcome>
              key={`${percentage ? 'percentage' : 'absolute'}-${groupDate}`}
              data={sanitizedData}
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
              margin={{ top: 5, right: 5, bottom: 24, left: 50 }}
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
              valueScale={!data?.metadata.totalDecisions ? { type: 'linear', min: 0, max: 1000 } : undefined}
              axisLeft={{
                legend: 'outcome (indexBy)',
                legendOffset: -70,
                tickValues: !data?.metadata.totalDecisions ? [0, 200, 400, 600, 800, 1000] : undefined,
              }}
              axisBottom={{
                tickValues: getXTickValues(),
                format: (value: string) => {
                  // Convert the ISO string to a Date object and format it
                  const date = new Date(value);
                  return date.toLocaleDateString(language, {
                    year: !isSameYear ? 'numeric' : undefined,
                    month: 'short',
                    day: groupDate !== 'monthly' ? 'numeric' : undefined,
                  });
                },
              }}
              tooltip={({ data }) => {
                const outcomes: Outcome[] = ['approve', 'decline', 'review', 'blockAndReview'];
                const totalValue = !percentage && typeof data.total === 'number' ? data.total : undefined;
                return (
                  <div className="flex flex-col gap-v2-xs bg-white p-v2-sm rounded-lg border border-grey-90 shadow-sm">
                    <div className="text-s text-grey-60 mb-v2-xs">{getTootlipDateFormat(data?.date)}</div>
                    <div className="flex flex-col gap-v2-xs">
                      {outcomes.map((outcome) => {
                        const outcomeValue = data?.[outcome] ?? 0;
                        const displayValue = percentage ? `${outcomeValue.toFixed(1)}%` : outcomeValue;
                        return (
                          <div key={outcome} className="flex items-center gap-v2-sm whitespace-nowrap">
                            <div
                              className="size-3 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: OUTCOME_COLORS[outcome] }}
                            />
                            <span className="text-s text-grey-00">
                              {t(getOutcomeTranslationKey(outcome))}:{' '}
                              <strong className="font-semibold">{displayValue}</strong>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {!percentage && totalValue !== undefined && (
                      <div className="flex items-center gap-v2-sm pt-v2-xs border-t border-grey-90 mt-v2-xs">
                        <span className="text-s text-grey-00 font-semibold">
                          {t('analytics:decisions.tooltip.total', { defaultValue: 'Total' })}: {totalValue}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
              theme={{
                tooltip: {
                  container: {
                    transform: 'translateX(16px)',
                  },
                },
              }}
              layout="vertical"
              motionConfig={{
                mass: 1,
                tension: 170,
                friction: 8,
                clamp: true,
                precision: 0.01,
                velocity: 0,
              }}

              //   markers={currentDataGroup?.scenarioVersionsXMarkers}
            />
          </div>
          <div className="flex w-full justify-end mt-v2-sm">
            <div className="flex gap-v2-sm">
              <ButtonV2
                disabled={!data?.daily || !data?.metadata.totalDecisions}
                variant="secondary"
                mode="normal"
                onClick={() => setGroupDate('daily')}
                className={groupDate === 'daily' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
              >
                {t('analytics:time_granularity.day')}
              </ButtonV2>
              <ButtonV2
                disabled={!data?.weekly || !data?.metadata.totalDecisions}
                variant="secondary"
                mode="normal"
                onClick={() => setGroupDate('weekly')}
                className={groupDate === 'weekly' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
              >
                {t('analytics:time_granularity.week')}
              </ButtonV2>
              <ButtonV2
                disabled={!data?.monthly || !data?.metadata.totalDecisions}
                variant="secondary"
                mode="normal"
                onClick={() => setGroupDate('monthly')}
                className={groupDate === 'monthly' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
              >
                {t('analytics:time_granularity.month')}
              </ButtonV2>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <OutcomeFilter decisions={decisions} onChange={setDecisions} highlight={isHovered} />
          </div>
        </div>
      </div>
    </div>
  );
}
