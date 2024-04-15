import { Page } from '@app-builder/components';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['navigation'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const dataModel = await dataModelRepository.getDataModel();
  return json({ dataModel });
}

export default function Data() {
  const { t } = useTranslation(handle.i18n);
  const { dataModel } = useLoaderData<typeof loader>();

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center">
          <Icon icon="harddrive" className="mr-2 size-6" />
          {t('navigation:data')}
        </div>
      </Page.Header>
      <DataModelContextProvider value={dataModel}>
        <Outlet />
      </DataModelContextProvider>
    </Page.Container>
  );
}
