import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, redirect } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/detection/analytics')} isLast={isLast}>
          {t('navigation:analytics')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn([authMiddleware], async function analyticsLayout({ context }) {
  const { user, entitlements } = context.authInfo;

  if (!isAnalyticsAvailable(user, entitlements)) {
    return redirect(getRoute('/detection'));
  }

  return null;
});

export default function AnalyticsLayout() {
  return <Outlet />;
}
