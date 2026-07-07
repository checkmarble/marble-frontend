import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ObservabilityPage } from '@app-builder/components/ContinuousScreening/ObservabilityPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const DATASET_UPDATES_PAGE_SIZE = 5;
const UPDATE_JOBS_PAGE_SIZE = 10;
const CLIENT_DATA_INDEXING_PAGE_SIZE = 20;

async function getObservabilityItems<T>(request: Promise<{ items: T[] }>) {
  const result = await tryCatch(request);
  return result.ok ? result.value.items : [];
}

const observabilityLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function continuousScreeningObservabilityLoader({ context }) {
    const { continuousScreening } = context.authInfo;
    const [datasetUpdates, updateJobs, clientDataIndexing] = await Promise.all([
      getObservabilityItems(
        continuousScreening.listDatasetUpdates({ limit: DATASET_UPDATES_PAGE_SIZE, order: 'DESC' }),
      ),
      getObservabilityItems(continuousScreening.listUpdateJobs({ limit: UPDATE_JOBS_PAGE_SIZE, order: 'DESC' })),
      getObservabilityItems(
        continuousScreening.listClientDataIndexing({ limit: CLIENT_DATA_INDEXING_PAGE_SIZE, order: 'DESC' }),
      ),
    ]);

    return {
      datasetUpdates,
      updateJobs,
      clientDataIndexing,
    };
  });

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
  loader: () => observabilityLoader(),
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
