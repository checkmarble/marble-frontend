import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/_builder/detection')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        return (
          <BreadCrumbLink to="/detection" isLast={isLast}>
            {t('navigation:detection')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  component: () => <Outlet />,
});
