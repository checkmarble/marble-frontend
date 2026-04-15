import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isScreeningSearchAvailable } from '@app-builder/services/feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

const screeningSearchLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function screeningSearchLayout({ context }) {
    const { entitlements } = context.authInfo;

    if (!isScreeningSearchAvailable(entitlements)) {
      throw redirect({ to: '/' });
    }

    return null;
  });

export const Route = createFileRoute('/_app/_builder/screening-search')({
  loader: () => screeningSearchLayoutLoader(),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);

        return (
          <BreadCrumbLink to="/screening-search" isLast={isLast}>
            <Icon icon="search" className="me-2 size-6" />
            <span>{t('navigation:screening_search')}</span>
          </BreadCrumbLink>
        );
      },
    ],
  },
  component: () => <Outlet />,
});
