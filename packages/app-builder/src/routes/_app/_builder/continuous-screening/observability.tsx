import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ObservabilityPage } from '@app-builder/components/ContinuousScreening/observability/ObservabilityPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { type ContinuousScreeningClientDataIndexingResponse } from '@app-builder/models/continuous-screening';
import { listClientDataIndexing, listDatasetUpdates, listUpdateJobs } from '@app-builder/server/continuous-screening';
import { tryCatch } from '@app-builder/utils/tryCatch';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const DATASET_UPDATES_PAGE_SIZE = 5;
const UPDATE_JOBS_PAGE_SIZE = 10;
const CLIENT_DATA_INDEXING_PAGE_SIZE = 20;

async function getObservabilityItems<T>(request: Promise<{ items: T[] }>) {
  const result = await tryCatch(request);
  return result.ok ? result.value.items : [];
}

async function getObservabilityClientDataIndexing(request: Promise<ContinuousScreeningClientDataIndexingResponse>) {
  const result = await tryCatch(request);
  return result.ok ? result.value : null;
}

const observabilityLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function continuousScreeningObservabilityLoader({ context }) {
    const { api, user } = context;

    if (!isAdmin(user)) {
      throw redirect({ to: '/app-router' });
    }

    const [datasetUpdates, updateJobs, clientDataIndexing] = await Promise.all([
      getObservabilityItems(listDatasetUpdates(api, { limit: DATASET_UPDATES_PAGE_SIZE, order: 'DESC' })),
      getObservabilityItems(listUpdateJobs(api, { limit: UPDATE_JOBS_PAGE_SIZE, order: 'DESC' })),
      getObservabilityClientDataIndexing(
        listClientDataIndexing(api, { limit: CLIENT_DATA_INDEXING_PAGE_SIZE, order: 'DESC' }),
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
