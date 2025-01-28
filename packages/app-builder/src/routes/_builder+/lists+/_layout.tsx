import {
  BreadCrumbLink,
  type BreadCrumbProps,
} from '@app-builder/components/Breadcrumbs';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/lists')} isLast={isLast}>
          <Icon icon="lists" className="me-2 size-6" />
          {t('navigation:lists')}
        </BreadCrumbLink>
      );
    },
  ],
};

export default function ListsLayout() {
  return <Outlet />;
}
