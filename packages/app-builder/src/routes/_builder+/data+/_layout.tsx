import { Page } from '@app-builder/components';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, redirect, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function dataLayout({ context }) {
  const { user, dataModelRepository, entitlements } = context.authInfo;

  if (isAnalyst(user)) {
    return redirect(getRoute('/cases'));
  }
  const dataModel = await dataModelRepository.getDataModel();

  return { dataModel, dataModelFeatureAccess: dataModelFeatureAccessLoader(user, entitlements) };
});

export default function Data() {
  const { dataModel, dataModelFeatureAccess } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
        <Outlet />
      </DataModelContextProvider>
    </Page.Main>
  );
}
