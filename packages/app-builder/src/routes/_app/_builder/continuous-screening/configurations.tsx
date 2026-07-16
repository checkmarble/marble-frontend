import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ConfigurationsPage } from '@app-builder/components/ContinuousScreening/ConfigurationsPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const configurationsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function continuousScreeningConfigurationsLoader({ context }) {
    const { continuousScreening, entitlements, inbox, screening, user } = context.authInfo;

    const configurationsPromise = isContinuousScreeningAvailable(entitlements)
      ? continuousScreening.listConfigurations()
      : Promise.resolve([]);

    const [configurationItems, datasets, inboxes] = await Promise.all([
      configurationsPromise,
      screening.getAvailableFilters({ feature: 'continuous_monitoring' }),
      inbox.listInboxes(),
    ]);

    const configurations = configurationItems.map((config) => {
      const inboxItem = inboxes.find((inboxItem) => inboxItem.id === config.inboxId);
      return { ...config, inbox: inboxItem };
    });

    return {
      canEdit: ['ADMIN', 'PUBLISHER'].includes(user.role),
      isAdmin: isAdmin(user),
      configurations,
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
  const { canEdit, configurations, datasets, isAdmin } = Route.useLoaderData();

  return <ConfigurationsPage canEdit={canEdit} configurations={configurations} datasets={datasets} isAdmin={isAdmin} />;
}
