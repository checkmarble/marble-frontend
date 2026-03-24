import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, redirect, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/detection/decisions')} isLast={isLast}>
          {t('navigation:decisions')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn([authMiddleware], async function dataLayout({ context }) {
  const { user, dataModelRepository, entitlements } = context.authInfo;

  if (isAnalyst(user)) {
    return redirect(getRoute('/cases'));
  }
  const dataModel = await dataModelRepository.getDataModel();

  const dataModelFeatureAccess = dataModelFeatureAccessLoader(user, entitlements);
  return { dataModel, dataModelFeatureAccess };
});

export default function DecisionsLayout() {
  const { dataModel, dataModelFeatureAccess } = useLoaderData<typeof loader>();

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <Outlet />
    </DataModelContextProvider>
  );
}
