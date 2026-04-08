import { UpsellCard } from '@app-builder/components/Analytics/UpsellCard';
import { CasesNavigationTabs } from '@app-builder/components/Cases/Navigation/Tabs';
import { Page } from '@app-builder/components/Page';
import { Spinner } from '@app-builder/components/Spinner';
import {
  aggregateFalsePositiveRate,
  aggregatePeriodCount,
  aggregatePeriodDuration,
  type TimeBucket,
} from '@app-builder/models/analytics/case-analytics';
import type { Inbox } from '@app-builder/models/inbox';
import type { User } from '@app-builder/models/user';
import { useCaseAnalytics } from '@app-builder/queries/cases/case-analytics';
import { add, subMonths } from 'date-fns';
import { type DateRangeFilterType } from 'packages/ui-design-system/src/FiltersBar/types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';

import { AlertMetricsChart } from './AlertMetricsChart';
import { AlertProcessingChart } from './AlertProcessingChart';
import { CaseAnalyticsFilters } from './CaseAnalyticsFilters';
import { SarDelayChart } from './SarDelayChart';
import { SarReportsGauge } from './SarReportsGauge';
import { TimeBucketToggle } from './TimeBucketToggle';

interface AnalyticsPageProps {
  inboxes: Inbox[];
  users: User[];
  isAnalyticsAvailable: boolean;
}

/**
 * Resolves a DateRangeFilterType into absolute { startDate, endDate } as YYYY-MM-DD strings.
 * Dynamic ranges are parsed via Temporal.Duration (e.g. '-P6M' for 6 months ago).
 */
function resolveDateRange(range: DateRangeFilterType): { startDate: string; endDate: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (!range) {
    return { startDate: subMonths(now, 6).toISOString().slice(0, 10), endDate: today };
  }

  if (range.type === 'static') {
    return {
      startDate: range.startDate ? range.startDate.slice(0, 10) : subMonths(now, 6).toISOString().slice(0, 10),
      endDate: range.endDate ? range.endDate.slice(0, 10) : today,
    };
  }

  // Dynamic: ISO 8601 duration with sign prefix (e.g. '-P6M', '-P30D')
  const start = add(now, Temporal.Duration.from(range.fromNow));
  return { startDate: start.toISOString().slice(0, 10), endDate: today };
}

export function AnalyticsPage({ inboxes, users, isAnalyticsAvailable }: AnalyticsPageProps) {
  const { t } = useTranslation(['cases', 'common']);

  const [dateRange, setDateRange] = useState<DateRangeFilterType>({
    type: 'dynamic',
    fromNow: Temporal.Duration.from({ months: -6 }).toString(),
  });
  const [inboxId, setInboxId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [timeBucket, setTimeBucket] = useState<TimeBucket>('month');

  const { startDate, endDate } = useMemo(() => resolveDateRange(dateRange), [dateRange]);

  const query = useCaseAnalytics({
    startDate,
    endDate,
    inboxId,
    userId,
  });

  const aggregated = useMemo(() => {
    if (!query.data) return null;
    return {
      sarTotalCompleted: query.data.sarTotalCompleted,
      sarDelayByPeriod: aggregatePeriodDuration(query.data.sarDelayByPeriod, timeBucket),
      sarDelayDistribution: query.data.sarDelayDistribution,
      alertCountByPeriod: aggregatePeriodCount(query.data.alertCountByPeriod, timeBucket),
      falsePositiveRateByPeriod: aggregateFalsePositiveRate(query.data.falsePositiveRateByPeriod, timeBucket),
      caseDurationByPeriod: aggregatePeriodDuration(query.data.caseDurationByPeriod, timeBucket),
      openCasesByAge: query.data.openCasesByAge,
    };
  }, [query.data, timeBucket]);

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md">
          <CasesNavigationTabs />

          <div className="flex flex-wrap items-center justify-between gap-v2-md">
            <CaseAnalyticsFilters
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              inboxId={inboxId}
              onInboxIdChange={setInboxId}
              inboxes={inboxes}
              userId={userId}
              onUserIdChange={setUserId}
              users={users}
            />
            <TimeBucketToggle value={timeBucket} onChange={setTimeBucket} />
          </div>

          {match(query)
            .with({ isPending: true }, () => (
              <div className="grid h-96 place-items-center">
                <Spinner className="size-12" />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="grid h-96 place-items-center">
                <div className="flex flex-col items-center gap-v2-sm">
                  <span className="text-s text-center text-grey-secondary">{t('common:generic_fetch_data_error')}</span>
                  <Button variant="secondary" onClick={() => query.refetch()}>
                    {t('common:retry')}
                  </Button>
                </div>
              </div>
            ))
            .with({ isSuccess: true }, () => {
              if (!aggregated) return null;

              return (
                <div className="flex flex-col gap-v2-md">
                  <div className="grid grid-cols-1 gap-v2-md xl:grid-cols-3">
                    <SarReportsGauge total={aggregated.sarTotalCompleted} />
                    <div className="xl:col-span-2">
                      {isAnalyticsAvailable ? (
                        <SarDelayChart
                          delayByPeriod={aggregated.sarDelayByPeriod}
                          delayDistribution={aggregated.sarDelayDistribution}
                        />
                      ) : (
                        <UpsellCard
                          className="h-full"
                          title={t('cases:analytics.upsell.title')}
                          description={t('cases:analytics.upsell.description')}
                          benefits={[
                            t('cases:analytics.upsell.benefit_1'),
                            t('cases:analytics.upsell.benefit_2'),
                            t('cases:analytics.upsell.benefit_3'),
                          ]}
                        />
                      )}
                    </div>
                  </div>

                  {isAnalyticsAvailable ? (
                    <>
                      <AlertMetricsChart
                        alertCountByPeriod={aggregated.alertCountByPeriod}
                        falsePositiveRateByPeriod={aggregated.falsePositiveRateByPeriod}
                      />

                      <AlertProcessingChart
                        caseDurationByPeriod={aggregated.caseDurationByPeriod}
                        openCasesByAge={aggregated.openCasesByAge}
                      />
                    </>
                  ) : null}
                </div>
              );
            })
            .exhaustive()}
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}
