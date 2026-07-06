import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ObservabilityPage } from '@app-builder/components/ContinuousScreening/ObservabilityPage';
import { listContinuousScreeningDatasetUpdatesFn } from '@app-builder/server-fns/continuous-screening';
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
  loader: () => listContinuousScreeningDatasetUpdatesFn({ data: { limit: 5, order: 'DESC' } }),
  component: ContinuousScreeningObservability,
});

function ContinuousScreeningObservability() {
  const { items } = Route.useLoaderData();
  return <ObservabilityPage datasetUpdates={items} />;
}
