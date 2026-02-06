import { Page } from '@app-builder/components';
import { Spinner } from '@app-builder/components/Spinner';
import { useGetDebugDeltaTracksQuery } from '@app-builder/queries/continuous-screening/debug-delta-tracks';
import { useGetDebugUpdateJobsQuery } from '@app-builder/queries/continuous-screening/debug-update-jobs';
import { type FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Tabs, tabClassName } from 'ui-design-system';

import { PaginationRow } from '../PaginationRow';
import { DeltaTracksTable } from './DeltaTracksTable';
import { UpdateJobsTable } from './UpdateJobsTable';

type ActiveTab = 'update-jobs' | 'delta-tracks';

interface ContinuousScreeningDebugPageProps {
  limit: number;
  updatePage: (newLimit: number) => void;
}

export const ContinuousScreeningDebugPage: FunctionComponent<ContinuousScreeningDebugPageProps> = ({
  limit,
  updatePage,
}) => {
  const { t } = useTranslation(['settings', 'common']);
  const [activeTab, setActiveTab] = useState<ActiveTab>('update-jobs');

  const updateJobsQuery = useGetDebugUpdateJobsQuery(limit);
  const deltaTracksQuery = useGetDebugDeltaTracksQuery(limit);

  const updateJobs = useMemo(() => {
    return updateJobsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  }, [updateJobsQuery.data?.pages]);

  const deltaTracks = useMemo(() => {
    return deltaTracksQuery.data?.pages.flatMap((page) => page.items) ?? [];
  }, [deltaTracksQuery.data?.pages]);

  const handleSetLimit = useCallback(
    (newLimit: number) => {
      updatePage(newLimit);
    },
    [updatePage],
  );

  const activeQuery = activeTab === 'update-jobs' ? updateJobsQuery : deltaTracksQuery;

  return (
    <Page.Container>
      <Page.ContentV2 className="gap-v2-md bg-surface-page">
        <div className="flex flex-col gap-v2-md relative">
          <div className="flex justify-between items-center">
            <h1 className="text-l font-semibold text-grey-primary">{t('settings:continuous_screening_debug')}</h1>
          </div>

          <Tabs>
            <button
              className={tabClassName}
              data-status={activeTab === 'update-jobs' ? 'active' : undefined}
              onClick={() => setActiveTab('update-jobs')}
            >
              {t('settings:continuous_screening_debug.tabs.update_jobs')}
            </button>
            <button
              className={tabClassName}
              data-status={activeTab === 'delta-tracks' ? 'active' : undefined}
              onClick={() => setActiveTab('delta-tracks')}
            >
              {t('settings:continuous_screening_debug.tabs.delta_tracks')}
            </button>
          </Tabs>

          {match(activeQuery)
            .with({ isPending: true }, () => (
              <div className="border border-grey-border rounded-v2-md">
                <div className="h-13 border-b border-grey-border"></div>
                <div className="h-30 bg-grey-background animate-pulse flex items-center justify-center">
                  <Spinner className="size-12" />
                </div>
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="border-red-disabled bg-red-background text-red-primary mt-3 rounded-sm border p-v2-lg flex flex-col gap-v2-sm items-center">
                <span>{t('common:errors.unknown')}</span>
                <Button variant="secondary" onClick={() => activeQuery.refetch()}>
                  {t('common:retry')}
                </Button>
              </div>
            ))
            .with({ isSuccess: true }, () =>
              activeTab === 'update-jobs' ? (
                <UpdateJobsTable items={updateJobs} />
              ) : (
                <DeltaTracksTable items={deltaTracks} />
              ),
            )
            .exhaustive()}

          <PaginationRow
            hasNextPage={activeQuery.hasNextPage ?? false}
            hasPreviousPage={false}
            currentLimit={limit}
            onNextPage={() => activeQuery.fetchNextPage()}
            onPreviousPage={() => undefined}
            setLimit={handleSetLimit}
            perPageLabel={t('settings:continuous_screening_debug.pagination.per_page')}
          />
        </div>
      </Page.ContentV2>
    </Page.Container>
  );
};
