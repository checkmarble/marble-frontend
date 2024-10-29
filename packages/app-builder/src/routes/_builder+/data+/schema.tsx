import { Page, TabLink } from '@app-builder/components';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import {
  DataModelFlow,
  dataModelFlowStyles,
} from '@app-builder/components/Data/DataModelFlow';
import { useDataModel } from '@app-builder/services/data/data-model';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Panel } from 'reactflow';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: dataModelFlowStyles },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { dataModelRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const pivots = await dataModelRepository.listPivots({});
  return json({ pivots });
}

export default function Data() {
  const dataModel = useDataModel();
  const { t } = useTranslation(handle.i18n);
  const { pivots } = useLoaderData<typeof loader>();

  return (
    <div className="size-full">
      <Page.Description>{t('data:your_data_callout')}</Page.Description>
      <DataModelFlow dataModel={dataModel} pivots={pivots}>
        <Panel position="top-left">
          <nav className="bg-grey-00 border-grey-10 w-fit rounded border p-px drop-shadow-md lg:p-[9px]">
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
            </ul>
          </nav>
        </Panel>
      </DataModelFlow>
    </div>
  );
}
