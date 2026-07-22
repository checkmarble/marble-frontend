import { Page } from '@app-builder/components/Page';
import { ScreeningNavigationTabs } from '@app-builder/components/Screenings/Navigation/Tabs';
import {
  type ContinuousScreeningClientDataIndexingResponse,
  type ContinuousScreeningDatasetUpdateSummary,
  type ContinuousScreeningUpdateJobSummary,
} from '@app-builder/models/continuous-screening';
import {
  CLIENT_DATA_INDEXING_PAGE_SIZE,
  useContinuousScreeningClientDataIndexingQuery,
} from '@app-builder/queries/continuous-screening/client-data-indexing';
import {
  DATASET_UPDATES_PAGE_SIZE,
  useContinuousScreeningDatasetUpdatesQuery,
} from '@app-builder/queries/continuous-screening/dataset-updates';
import {
  UPDATE_JOBS_PAGE_SIZE,
  useContinuousScreeningUpdateJobsQuery,
} from '@app-builder/queries/continuous-screening/update-jobs';
import { cn } from 'ui-design-system';
import { pageLayoutGutter } from '../../Page/page-layout';
import { ClientDataIndexing } from './ClientDataIndexing';
import { DatasetUpdate } from './DatasetUpdate';
import { UpdateJobs } from './UpdateJobs';
import { areAllStatusesCompleted, getObservabilityRefetchInterval } from './utils';

type ObservabilityPageProps = {
  datasetUpdates: ContinuousScreeningDatasetUpdateSummary[];
  updateJobs: ContinuousScreeningUpdateJobSummary[];
  clientDataIndexing: ContinuousScreeningClientDataIndexingResponse | null;
};

export function ObservabilityPage({ datasetUpdates, updateJobs, clientDataIndexing }: ObservabilityPageProps) {
  const updateJobsQuery = useContinuousScreeningUpdateJobsQuery(
    { limit: UPDATE_JOBS_PAGE_SIZE },
    {
      refetchInterval: (query) => getObservabilityRefetchInterval(areAllStatusesCompleted(query.state.data ?? [])),
      initialData: updateJobs,
    },
  );

  const clientDataIndexingQuery = useContinuousScreeningClientDataIndexingQuery(
    { limit: CLIENT_DATA_INDEXING_PAGE_SIZE },
    {
      refetchInterval: (query) => getObservabilityRefetchInterval((query.state.data?.pendingItems ?? 0) === 0),
      ...(clientDataIndexing === null ? {} : { initialData: clientDataIndexing }),
    },
  );

  const datasetUpdatesQuery = useContinuousScreeningDatasetUpdatesQuery(
    { limit: DATASET_UPDATES_PAGE_SIZE },
    {
      refetchInterval: (query) => getObservabilityRefetchInterval(areAllStatusesCompleted(query.state.data ?? [])),
      initialData: datasetUpdates,
    },
  );

  const clientDataIndexingData = clientDataIndexingQuery.data ?? clientDataIndexing;

  return (
    <Page.Main>
      <Page.Content>
        <div className={cn('flex flex-col', pageLayoutGutter.gap)}>
          <ScreeningNavigationTabs />
          <div className={cn('grid grid-cols-1 lg:grid-cols-2', pageLayoutGutter.gap)}>
            <ClientDataIndexing data={clientDataIndexingData} />
            <DatasetUpdate data={datasetUpdatesQuery.data ?? datasetUpdates} />
            <UpdateJobs data={updateJobsQuery.data ?? updateJobs} />
          </div>
        </div>
      </Page.Content>
    </Page.Main>
  );
}
