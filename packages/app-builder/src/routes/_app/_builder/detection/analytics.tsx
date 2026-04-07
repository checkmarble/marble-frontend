import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';

const analyticsLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function analyticsLayout({ context }) {
    const { user, entitlements } = context.authInfo;

    if (!isAnalyticsAvailable(user, entitlements)) {
      throw redirect({ to: '/detection' });
    }

    return null;
  });

export const Route = createFileRoute('/_app/_builder/detection/analytics')({
  loader: () => analyticsLayoutLoader(),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);

        return (
          <BreadCrumbLink to="/detection/analytics" isLast={isLast}>
            {t('navigation:analytics')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  component: () => <Outlet />,
});
