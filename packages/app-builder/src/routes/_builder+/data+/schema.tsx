import { TabLink } from '@app-builder/components';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import {
  DataModelFlow,
  dataModelFlowStyles,
} from '@app-builder/components/Data/DataModelFlow';
import { useDataModel } from '@app-builder/services/data/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { type LinksFunction } from '@remix-run/node';
import { type Namespace } from 'i18next';
import { Panel } from 'reactflow';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: dataModelFlowStyles },
];

export default function Data() {
  const dataModel = useDataModel();

  return (
    <div className="size-full">
      <DataModelFlow dataModel={dataModel}>
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
