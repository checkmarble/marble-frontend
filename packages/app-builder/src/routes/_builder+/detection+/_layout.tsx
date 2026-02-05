import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/detection')} isLast={isLast}>
          <Icon icon="scenarios" className="me-2 size-6" />
          {t('navigation:detection')}
        </BreadCrumbLink>
      );
    },
  ],
};

export default function DetectionLayout() {
  return <Outlet />;
}
