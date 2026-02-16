import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, redirect } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const loader = createServerFn([authMiddleware], async function detectionLayout({ context }) {
  if (isAnalyst(context.authInfo.user)) {
    return redirect(getRoute('/cases'));
  }
  return null;
});

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
