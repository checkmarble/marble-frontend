import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { canAccessScenarios } from '@app-builder/services/feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const detectionLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function detectionLayout({ context }) {
    if (!canAccessScenarios(context.authInfo.user)) {
      throw redirect({ to: '/cases' });
    }
    return null;
  });

export const Route = createFileRoute('/_app/_builder/detection')({
  loader: () => detectionLayoutLoader(),
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
