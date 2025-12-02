import { BreadCrumbLink, BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ConfigurationsPage } from '@app-builder/components/ContinuousScreening/ConfigurationsPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/continuous-screening/configurations')} isLast={isLast}>
          {t('navigation:continuous-screening.configurations')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn([authMiddleware], async () => {
  return null;
});

export default function ContinuousScreeningConfigurations() {
  return <ConfigurationsPage />;
}
