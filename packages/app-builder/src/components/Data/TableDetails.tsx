import { type DataModel, type TableModel } from '@app-builder/models/data-model';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { dataI18n } from './data-i18n';
import { EditTableDrawer } from './SemanticTables/EditTable/EditTableDrawer';

interface TableDetailsProps {
  tableModel: TableModel;
  dataModel: DataModel;
}

export function TableDetails({ tableModel, dataModel }: TableDetailsProps) {
  const { t } = useTranslation(dataI18n);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="border border-grey-border rounded-lg px-v2-md py-v2-xl">
        <div className="flex items-center gap-v2-sm">
          <div className="flex-1 flex flex-col gap-v2-xs">
            <h4 className="font-semibold">{tableModel.name}</h4>
            <div className="flex gap-v2-xs">
              {tableModel.semanticType === 'other' ? (
                <Tag color="red">{t('data:table_details.other_table')}</Tag>
              ) : (
                <Tag color="grey">{t(`data:upload_data.ftm_entity.${tableModel.semanticType}`)}</Tag>
                // TODO: add sub entity
              )}
              <Tag color="grey">{t('data:table_details.numser_of_fields', { number: tableModel.fields.length })}</Tag>
            </div>
          </div>
          <Button variant="secondary" appearance="stroked" onClick={() => setIsEditOpen(true)}>
            <Icon icon="eye" className="size-5" />
          </Button>
        </div>
      </div>
      <EditTableDrawer
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        tableModel={tableModel}
        dataModel={dataModel}
        onSave={async () => {
          // TODO: implement save mutations
        }}
      />
    </>
  );
}
