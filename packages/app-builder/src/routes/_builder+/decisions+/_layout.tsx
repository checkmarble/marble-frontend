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
        <BreadCrumbLink
          to={`${getRoute('/decisions')}?dateRange%5Btype%5D=dynamic&dateRange%5BfromNow%5D=-P14D`}
          isLast={isLast}
        >
          <Icon icon="decision" className="me-2 size-6" />
          {t('navigation:decisions')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const DecisionLayout = () => {
  return <Outlet />;
};
