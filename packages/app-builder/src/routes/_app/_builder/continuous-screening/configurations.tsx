import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ConfigurationsPage } from '@app-builder/components/ContinuousScreening/ConfigurationsPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { listContinuousScreeningConfigurationsFn } from '@app-builder/server-fns/continuous-screening';
import { getListConfigFn } from '@app-builder/server-fns/screenings';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const configurationsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function continuousScreeningConfigurationsLoader({ context }) {
    const { user } = context.authInfo;
    const [listContinuousScreeningConfigurations, datasets] = await Promise.all([
      listContinuousScreeningConfigurationsFn(),
      getListConfigFn({ data: { feature: 'continuous_monitoring' } }),
    ]);

    return {
      canEdit: ['ADMIN', 'PUBLISHER'].includes(user.role),
      configurations: listContinuousScreeningConfigurations.configurations,
      datasets,
    };
  });

export const Route = createFileRoute('/_app/_builder/continuous-screening/configurations')({
  staticData: {
    i18n: ['navigation', 'continuousScreening'],
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        return (
          <BreadCrumbLink to="/continuous-screening/configurations" isLast={isLast}>
            {t('navigation:continuous-screening.configurations')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  loader: () => configurationsLoader(),
  component: ContinuousScreeningConfigurations,
});

function ContinuousScreeningConfigurations() {
  const { canEdit, configurations, datasets } = Route.useLoaderData();

  return <ConfigurationsPage canEdit={canEdit} configurations={configurations} datasets={datasets} />;
}
