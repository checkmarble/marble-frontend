import { CreateTable } from '@app-builder/components/Data/CreateTable';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { TableDetails } from '@app-builder/components/Data/TableDetails';
import { useDataModel, useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: dataI18n satisfies Namespace,
};

export default function DataList() {
  const { t } = useTranslation(handle.i18n);
  const dataModel = useDataModel();
  const { isCreateDataModelTableAvailable } = useDataModelFeatureAccess();

  return (
    <>
      {isCreateDataModelTableAvailable ? (
        <CreateTable>
          <Button className="w-fit">
            <Icon icon="plus" className="size-6" />
            {t('data:create_table.title')}
          </Button>
        </CreateTable>
      ) : null}
      {dataModel.map((table) => (
        <TableDetails key={table.name} tableModel={table} dataModel={dataModel} />
      ))}
    </>
  );
}
