import { BreadCrumbLink, BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { ConfigurationsPage } from '@app-builder/components/ContinuousScreening/ConfigurationsPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { useLoaderData } from '@remix-run/react';
import { Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['navigation', 'continuousScreening'] satisfies Namespace,
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

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const userRole = context.authInfo.user.role;

  return {
    canEdit: ['ADMIN', 'PUBLISHER'].includes(userRole),
  };
});

export default function ContinuousScreeningConfigurations() {
  const { canEdit } = useLoaderData<typeof loader>();

  return <ConfigurationsPage canEdit={canEdit} />;
}
