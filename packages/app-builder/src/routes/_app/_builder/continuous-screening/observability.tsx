import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ObservabilityPage } from '@app-builder/components/ContinuousScreening/ObservabilityPage';
import { UPDATE_JOBS_PAGE_SIZE } from '@app-builder/queries/continuous-screening/update-jobs';
import {
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
    const [datasetUpdates, updateJobs] = await Promise.all([
      listContinuousScreeningDatasetUpdatesFn({ data: { limit: 5, order: 'DESC' } }),
      listContinuousScreeningUpdateJobsFn({ data: { limit: UPDATE_JOBS_PAGE_SIZE, order: 'DESC' } }),
    ]);
    return { datasetUpdates: datasetUpdates.items, updateJobs: updateJobs.items };
  },
  component: ContinuousScreeningObservability,
});

function ContinuousScreeningObservability() {
  const { datasetUpdates, updateJobs } = Route.useLoaderData();
  return <ObservabilityPage datasetUpdates={datasetUpdates} updateJobs={updateJobs} />;
}
