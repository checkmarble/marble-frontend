import { DataModelFlow, dataModelFlowStyles } from '@app-builder/components/Data/DataModelFlow';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { useDataModel } from '@app-builder/services/data/data-model';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: dataModelFlowStyles }];

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const pivots = await dataModelRepository.listPivots({});
  return json({ pivots });
}

export default function DataSchema() {
  const dataModel = useDataModel();
  const { pivots } = useLoaderData<typeof loader>();

  return (
    <div className="flex size-full flex-col -mx-6 -mb-6">
      <DataModelFlow dataModel={dataModel} pivots={pivots} />
    </div>
  );
}
