import { ErrorComponent } from '@app-builder/components';
import { Filters } from '@app-builder/components/Analytics/Filters';
import { OutcomeFilter } from '@app-builder/components/Analytics/OutcomeFilter';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { FilterItem, FilterPopover } from '@app-builder/components/Filters';
import { type DecisionsFilter, Outcome, outcomeColors } from '@app-builder/models/analytics';
import { initServerServices } from '@app-builder/services/init.server';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { ResponsiveBar } from '@nivo/bar';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useRouteError } from '@remix-run/react';
import { captureRemixErrorBoundaryError } from '@sentry/remix';
import { differenceInCalendarDays, format, startOfMonth, startOfWeek } from 'date-fns';
import { type Namespace } from 'i18next';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
export type DecisionsPerOutcome = {
  date: string;
  approve: number;
  decline: number;
  review: number;
  blockAndReview: number;
};
export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/analytics')} isLast={isLast}>
          <Icon icon="analytics" className="me-2 size-6" />
          <span className="line-clamp-1 text-start">{t('navigation:analytics')}</span>
        </BreadCrumbLink>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { analytics, scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const scenarioId = params['scenarioId']!;

  const scenarios = await scenario.listScenarios();

  const start = new Date('2025-09-01');
  const end = new Date('2025-09-19');

  const decisionsOutcomesPerDay = await analytics.getDecisionOutcomesPerDay({
    scenarioId,
    start,
    end,
    trigger: [],
  });
  return Response.json({
    start,
    end,
    decisionsOutcomesPerDay,
    scenarioId,
    scenarios,
  });
}

export default function Analytics() {
  const { decisionsOutcomesPerDay, start, end, scenarioId, scenarios } =
    useLoaderData<typeof loader>();
  const language = useFormatLanguage();
  const navigate = useNavigate();

  // Decision filter default values
  const defaultDecisions: DecisionsFilter = new Map([
    ['decline', true],
    ['blockAndReview', true],
    ['review', true],
    ['approve', false],
  ]);
  const [decisions, setDecisions] = useState<DecisionsFilter>(defaultDecisions);

  const [percentage, setPercentage] = useState(true);
  const [groupDate, setGroupDate] = useState<'day' | 'week' | 'month'>('day');

  // Group data by day, week, or month based on groupDate state
  const groupedData = useMemo(() => {
    if (groupDate === 'day') {
      return decisionsOutcomesPerDay;
    }

    const dataToGroup = percentage
      ? decisionsOutcomesPerDay.ratio
      : decisionsOutcomesPerDay.absolute;
    const grouped = new Map<string, DecisionsPerOutcome>();

    dataToGroup.forEach(
      (item: {
        date: Date;
        approve: number;
        decline: number;
        review: number;
        blockAndReview: number;
      }) => {
        const date = item.date;
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
            date: groupKey,
            approve: existing.approve + item.approve,
            decline: existing.decline + item.decline,
            review: existing.review + item.review,
            blockAndReview: existing.blockAndReview + item.blockAndReview,
          });
        } else {
          grouped.set(groupKey, {
            date: groupKey,
            approve: item.approve,
            decline: item.decline,
            review: item.review,
            blockAndReview: item.blockAndReview,
          });
        }
      },
    );

    const groupedArray = Array.from(grouped.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return {
      ratio: groupedArray,
      absolute: groupedArray,
    };
  }, [decisionsOutcomesPerDay, groupDate, percentage]);

  // const refinedData = useMemo(() => {
  //   if (percentage) {
  //     const tt = data.map(({ approve, review, block_and_review, decline, ...rest }) => {
  //       console.log(approve, review, block_and_review, decline);

  //       const total = approve + review + block_and_review + decline;
  //       console.log('total', total);
  //       return {
  //         ...rest,
  //         approve: (100 * approve) / total,
  //         review: (100 * review) / total,
  //         block_and_review: (100 * block_and_review) / total,
  //         decline: (100 * decline) / total,
  //       };
  //     });
  //     console.log('tt', tt);
  //     tt.forEach((item) => {
  //       console.log(item);
  //       console.log(item.approve + item.review + item.block_and_review + item.decline);
  //     });
  //     return tt;
  //   }
  //   return data;
  // }, [data, percentage]);

  // Return the first and last day of the period and numberOfValues days in between reparted in the period
  const getGridXValues = (numberOfValues: number): string[] => {
    if (!start || !end) return [];
    const days = differenceInCalendarDays(end, start);
    const daysInBetween = days / numberOfValues;
    const gridXValues: string[] = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);
    while (currentDate <= endDate) {
      gridXValues.push(currentDate.toISOString());
      currentDate.setDate(currentDate.getDate() + daysInBetween);
    }
    return gridXValues;
  };

  return (
    <>
      <div className="flex flex-row gap-4">
        <div className="flex flex-row gap-2 items-center">
          <Filters
            scenarios={scenarios}
            selectedScenarioId={scenarioId}
            onSelectedScenarioIdChange={(scenarioId) => {
              console.log('scenarioId changed to ', scenarioId);
              navigate(getRoute('/analytics/:scenarioId', { scenarioId }));
            }}
          />

          <FilterPopover.Root key={'dateRange1'} onOpenChange={() => console.log('onOpenChange')}>
            <FilterItem.Root>
              <FilterItem.Trigger>
                <Icon icon="calendar-month" className="size-5" />
                <span className="text-s font-semibold first-letter:capitalize">
                  Period from{' '}
                  {formatDateTimeWithoutPresets(start, {
                    language,
                    dateStyle: 'short',
                  })}{' '}
                  to{' '}
                  {formatDateTimeWithoutPresets(end, {
                    language,
                    dateStyle: 'short',
                  })}
                </span>
              </FilterItem.Trigger>
              <FilterItem.Clear
                onClick={() => {
                  console.log('clear');
                }}
              />
            </FilterItem.Root>
            <FilterPopover.Content>
              {/* <FilterDetail filterName={filterName} />   */}
            </FilterPopover.Content>
          </FilterPopover.Root>
          {/* <DateRangeFilter.Root
            dateRangeFilter={{
              type: 'static',
              startDate: start,
              endDate: end,
            }}
            setDateRangeFilter={() => console.log('setDateRangeFilter')}
            className="grid"
          >
            <DateRangeFilter.FromNowPicker title={t('cases:filters.date_range.title')} />
            <Separator className="bg-grey-90" decorative orientation="vertical" />
            <DateRangeFilter.Calendar />
            <Separator className="bg-grey-90 col-span-3" decorative orientation="horizontal" />
            <DateRangeFilter.Summary className="col-span-3 row-span-1" />
          </DateRangeFilter.Root> */}
        </div>
      </div>
      <div className="flex w-3xl h-96 p-4 flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <span className="text-s">Count:</span>
          <div className="flex gap-1">
            <Button
              variant={percentage ? 'outline' : 'secondary'}
              size="default"
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
            </Button>
            <Button
              variant={!percentage ? 'outline' : 'secondary'}
              size="default"
              onClick={() => setPercentage(false)}
              className={!percentage ? 'bg-purple-98 border-purple-65 text-purple-65' : ''}
            >
              #
            </Button>
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
                : Array.from(decisions)
                    .filter(([_, value]) => value)
                    .map(([key]) => key)
            }
            padding={0.5}
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            colors={({ id }) => outcomeColors[id as Outcome] ?? '#9ca3af'}
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
              className={
                groupDate === 'month' ? 'bg-purple-98 border-purple-65 text-purple-65' : ''
              }
            >
              Month
            </ButtonV2>
          </div>
        </div>
        <div className="flex w-full max-w-5xl ml-16">
          <OutcomeFilter decisions={decisions} onChange={setDecisions} />
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  //TODO: handle 404 error if needed but it should not occur

  return <ErrorComponent error={error} />;
}

export function shouldRevalidate({
  currentParams,
  nextParams,
}: {
  currentParams: any;
  nextParams: any;
}) {
  // Revalidate when scenarioId changes
  return currentParams.scenarioId !== nextParams.scenarioId;
}
