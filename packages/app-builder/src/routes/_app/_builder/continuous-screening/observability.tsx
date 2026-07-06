import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ObservabilityPage } from '@app-builder/components/ContinuousScreening/ObservabilityPage';
import { CLIENT_DATA_INDEXING_PAGE_SIZE } from '@app-builder/queries/continuous-screening/client-data-indexing';
import { DATASET_UPDATES_PAGE_SIZE } from '@app-builder/queries/continuous-screening/dataset-updates';
import { UPDATE_JOBS_PAGE_SIZE } from '@app-builder/queries/continuous-screening/update-jobs';
import {
  listContinuousScreeningClientDataIndexingFn,
  listContinuousScreeningDatasetUpdatesFn,
  listContinuousScreeningUpdateJobsFn,
} from '@app-builder/server-fns/continuous-screening';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/_builder/continuous-screening/observability')({
  staticData: {
    i18n: ['navigation', 'continuousScreening', 'screenings'],
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['screenings']);
        return (
          <BreadCrumbLink to="/continuous-screening/observability" isLast={isLast}>
            {t('screenings:navigation.observability')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  loader: async () => {
    const [datasetUpdates, updateJobs, clientDataIndexing] = await Promise.all([
      listContinuousScreeningDatasetUpdatesFn({ data: { limit: DATASET_UPDATES_PAGE_SIZE, order: 'DESC' } }),
      listContinuousScreeningUpdateJobsFn({ data: { limit: UPDATE_JOBS_PAGE_SIZE, order: 'DESC' } }),
      listContinuousScreeningClientDataIndexingFn({ data: { limit: CLIENT_DATA_INDEXING_PAGE_SIZE, order: 'DESC' } }),
    ]);
    return {
      datasetUpdates: datasetUpdates.items,
      updateJobs: updateJobs.items,
      clientDataIndexing: clientDataIndexing.items,
    };
  },
  component: ContinuousScreeningObservability,
});

function ContinuousScreeningObservability() {
  const { datasetUpdates, updateJobs, clientDataIndexing } = Route.useLoaderData();
  return (
    <ObservabilityPage
      datasetUpdates={datasetUpdates}
      updateJobs={updateJobs}
      clientDataIndexing={clientDataIndexing}
    />
  );
}
