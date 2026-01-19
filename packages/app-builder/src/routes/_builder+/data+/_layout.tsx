import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import {
  isCreateDataModelFieldAvailable,
  isCreateDataModelLinkAvailable,
  isCreateDataModelPivotAvailable,
  isCreateDataModelTableAvailable,
  isEditDataModelFieldAvailable,
  isEditDataModelInfoAvailable,
  isIngestDataAvailable,
} from '@app-builder/services/feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation', 'data'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);

      return (
        <BreadCrumbLink to={getRoute('/data')} isLast={isLast}>
          <Icon icon="harddrive" className="me-2 size-6" />
          {t('navigation:data')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn([authMiddleware], async function dataLayout({ context }) {
  const { user, dataModelRepository } = context.authInfo;

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
    },
  };
});

export default function Data() {
  const { t } = useTranslation(handle.i18n);
  const { dataModel, dataModelFeatureAccess } = useLoaderData<typeof loader>();

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
        <Page.Description>{t('data:your_data_callout')}</Page.Description>
        <Outlet />
      </DataModelContextProvider>
    </Page.Main>
  );
}
