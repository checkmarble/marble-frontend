import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/detection/scenarios')} isLast={isLast}>
          <span>{t('navigation:scenarios')}</span>
        </BreadCrumbLink>
      );
    },
  ],
};

export default function ScenariosLayout() {
  return <Outlet />;
}
