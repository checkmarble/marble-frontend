import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
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
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Tabs, tabClassName } from 'ui-design-system';
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { user, dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const dataModel = await dataModelRepository.getDataModel();
  return json({
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
  });
}

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
        <Page.Container>
          <Page.Content>
            <Tabs>
              <NavLink to={getRoute('/data/list')} className={tabClassName}>
                <Icon icon="lists" className="mr-1 size-5" />
                {t('navigation:data.list')}
              </NavLink>
              <NavLink to={getRoute('/data/schema')} className={tabClassName}>
                <Icon icon="tree-schema" className="mr-1 size-5" />
                {t('navigation:data.schema')}
              </NavLink>
              <NavLink to={getRoute('/data/view')} className={tabClassName}>
                <Icon icon="visibility" className="mr-1 size-5" />
                {t('navigation:data.viewer')}
              </NavLink>
            </Tabs>
            <Outlet />
          </Page.Content>
        </Page.Container>
      </DataModelContextProvider>
    </Page.Main>
  );
}
