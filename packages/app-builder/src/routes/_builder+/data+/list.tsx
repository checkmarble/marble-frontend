import {
  Callout,
  Page,
  TabLink,
  usePermissionsContext,
} from '@app-builder/components';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { TableDetails } from '@app-builder/components/Data/TableDetails';
import { CreateTable } from '@app-builder/routes/ressources+/data+/createTable';
import { useDataModel } from '@app-builder/services/data/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export default function Data() {
  const { t } = useTranslation(handle.i18n);
  const { canEditDataModel } = usePermissionsContext();
  const dataModel = useDataModel();

  return (
    <Page.Content>
      <nav className="border border-transparent">
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
      <Callout className="whitespace-normal" variant="outlined">
        {t('data:your_data_callout')}
      </Callout>
      {canEditDataModel ? (
        <CreateTable>
          <Button className="w-fit">
            <Icon icon="plus" className="size-6" />
            {t('data:create_table.title')}
          </Button>
        </CreateTable>
      ) : null}
      {dataModel.map((table) => (
        <TableDetails
          key={table.name}
          tableModel={table}
          dataModel={dataModel}
        />
      ))}
    </Page.Content>
  );
}
