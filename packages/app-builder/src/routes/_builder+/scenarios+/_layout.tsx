import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/scenarios')} isLast={isLast}>
          <Icon icon="scenarios" className="me-2 size-6" />
          <span>{t('navigation:scenarios')}</span>
        </BreadCrumbLink>
      );
    },
  ],
};

export default function ScenarioLayout() {
  return <Outlet />;
}
