import { Page } from '@app-builder/components';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import {
  hasAnyEntitlement,
  isCreateDataModelFieldAvailable,
  isCreateDataModelLinkAvailable,
  isCreateDataModelPivotAvailable,
  isCreateDataModelTableAvailable,
  isDeleteDataModelFieldAvailable,
  isDeleteDataModelLinkAvailable,
  isDeleteDataModelPivotAvailable,
  isDeleteDataModelTableAvailable,
  isEditDataModelFieldAvailable,
  isEditDataModelInfoAvailable,
  isIngestDataAvailable,
} from '@app-builder/services/feature-access';
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
  return {
    dataModel,
    dataModelFeatureAccess: {
      isCreateDataModelTableAvailable: isCreateDataModelTableAvailable(user),
      isEditDataModelInfoAvailable: isEditDataModelInfoAvailable(user),
      isCreateDataModelFieldAvailable: isCreateDataModelFieldAvailable(user),
      isEditDataModelFieldAvailable: isEditDataModelFieldAvailable(user),
      isCreateDataModelLinkAvailable: isCreateDataModelLinkAvailable(user),
      isCreateDataModelPivotAvailable: isCreateDataModelPivotAvailable(user),
      isIngestDataAvailable: isIngestDataAvailable(user),
      isDeleteDataModelTableAvailable: isDeleteDataModelTableAvailable(user),
      isDeleteDataModelFieldAvailable: isDeleteDataModelFieldAvailable(user),
      isDeleteDataModelLinkAvailable: isDeleteDataModelLinkAvailable(user),
      isDeleteDataModelPivotAvailable: isDeleteDataModelPivotAvailable(user),
      isIpGpsAvailable: hasAnyEntitlement(entitlements),
    },
  };
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
