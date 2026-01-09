import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/screening-search')} isLast={isLast}>
          <Icon icon="search" className="me-2 size-6" />
          <span>{t('navigation:screening_search')}</span>
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn([authMiddleware], async () => {
  return null;
});

export default function ScreeningSearchLayout() {
  return <Outlet />;
}
