import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { dataModelFeatureAccessLoader } from '@app-builder/routes/_builder+/data+/_layout';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          <Icon icon="case-manager" className="me-2 size-6" />
          {t('navigation:case_manager')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn([authMiddleware], async function dataLayout({ context, request }) {
  const { user, dataModelRepository, entitlements } = context.authInfo;

  const dataModel = await dataModelRepository.getDataModel();

  const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
  return { dataModel, dataModelFeatureAccess };
});

export default function CasesLayout() {
  const { dataModel, dataModelFeatureAccess } = useLoaderData<typeof loader>();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <Outlet />
    </DataModelContextProvider>
  );
}
