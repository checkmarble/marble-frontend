import { TabLink } from '@app-builder/components';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { DataModelFlow, dataModelFlowStyles } from '@app-builder/components/Data/DataModelFlow';
import { useDataModel } from '@app-builder/services/data/data-model';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LinksFunction, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Icon } from 'ui-icons';

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

export default function Data() {
  const dataModel = useDataModel();
  const { pivots } = useLoaderData<typeof loader>();

  return (
    <div className="flex size-full flex-col">
      <DataModelFlow dataModel={dataModel} pivots={pivots}>
        <div className="absolute left-2 top-2 z-10 lg:left-6 lg:top-6">
          <nav className="bg-grey-100 border-grey-90 w-fit rounded border p-2 drop-shadow-md">
            <ul className="flex flex-row gap-2">
              <li>
                <TabLink
                  labelTKey="navigation:data.list"
                  to={getRoute('/data/list')}
                  Icon={(props) => <Icon {...props} icon="lists" />}
                />
              </li>
              <li>
                <TabLink
                  labelTKey="navigation:data.schema"
                  to={getRoute('/data/schema')}
                  Icon={(props) => <Icon {...props} icon="tree-schema" />}
                />
              </li>
              <li>
                <TabLink
                  labelTKey="navigation:data.viewer"
                  to={getRoute('/data/view')}
                  Icon={(props) => <Icon {...props} icon="visibility" />}
                />
              </li>
            </ul>
          </nav>
        </div>
      </DataModelFlow>
    </div>
  );
}
