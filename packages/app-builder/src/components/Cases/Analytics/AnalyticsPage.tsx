import { CasesNavigationTabs } from '@app-builder/components/Cases/Navigation/Tabs';
import { Page } from '@app-builder/components/Page';
import { Spinner } from '@app-builder/components/Spinner';
import type { TimeBucket } from '@app-builder/models/analytics/case-analytics';
import type { Inbox } from '@app-builder/models/inbox';
import type { User } from '@app-builder/models/user';
import { useCaseAnalytics } from '@app-builder/queries/cases/case-analytics';
import { subMonths } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button } from 'ui-design-system';

import { AlertMetricsChart } from './AlertMetricsChart';
import { AlertProcessingChart } from './AlertProcessingChart';
import { CaseAnalyticsFilters } from './CaseAnalyticsFilters';
import { CasesAboveSlaChart } from './CasesAboveSlaChart';
import { SarDelayChart } from './SarDelayChart';
import { SarReportsGauge } from './SarReportsGauge';

interface AnalyticsPageProps {
  inboxes: Inbox[];
  users: User[];
}

export function AnalyticsPage({ inboxes, users }: AnalyticsPageProps) {
  const { t } = useTranslation(['cases', 'common']);

  const [timeBucket, setTimeBucket] = useState<TimeBucket>('month');
  const [startDate, setStartDate] = useState(subMonths(new Date(), 6).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [inboxId, setInboxId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  const query = useCaseAnalytics({
    startDate,
    endDate,
    timeBucket,
    inboxId,
    userId,
  });

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md">
          <CasesNavigationTabs />

          <CaseAnalyticsFilters
            timeBucket={timeBucket}
            onTimeBucketChange={setTimeBucket}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            inboxId={inboxId}
            onInboxIdChange={setInboxId}
            inboxes={inboxes}
            userId={userId}
            onUserIdChange={setUserId}
            users={users}
          />

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
            .with({ isSuccess: true }, (q) => {
              if (!q.data) return null;
              const data = q.data;

              return (
                <div className="flex flex-col gap-v2-md">
                  <div className="grid grid-cols-1 gap-v2-md xl:grid-cols-3">
                    <SarReportsGauge total={data.sarTotalCompleted} />
                    <div className="xl:col-span-2">
                      <SarDelayChart
                        delayByPeriod={data.sarDelayByPeriod}
                        delayDistribution={data.sarDelayDistribution}
                      />
                    </div>
                  </div>

                  <AlertMetricsChart
                    alertCountByPeriod={data.alertCountByPeriod}
                    falsePositiveRateByPeriod={data.falsePositiveRateByPeriod}
                  />

                  <AlertProcessingChart
                    caseDurationByPeriod={data.caseDurationByPeriod}
                    openCasesByAge={data.openCasesByAge}
                  />

                  <CasesAboveSlaChart casesAboveSla={data.casesAboveSla} />
                </div>
              );
            })
            .exhaustive()}
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
}
