import { type TableModel } from '@app-builder/models/data-model';
import { type Node, type NodeProps } from '@xyflow/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { dataI18n } from '../../data-i18n';
import { EditTableDrawer } from '../EditTable/EditTableDrawer';
import { LinkValue, SemanticTableFormValues } from '../Shared/semanticData-types';

export interface TableDetailsProps {
  tableModel: TableModel;
}

type TableDetailsFlowNode = Node<
  TableDetailsProps & { type: 'table_model'; state: 'initialized' | 'laid_out' | 'visible' } & Record<string, unknown>,
  'table_model'
>;

export function TableDetails({ data }: NodeProps<TableDetailsFlowNode>) {
  const { t } = useTranslation(dataI18n);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="border border-grey-border rounded-lg px-v2-md py-v2-xl">
        <div className="flex items-center gap-v2-sm">
          <div className="flex-1 flex flex-col gap-v2-xs">
            <h4 className="font-semibold">{data.tableModel.name}</h4>
            <div className="flex gap-v2-xs">
              {data.tableModel.semanticType == null ? (
                <Tag color="red">{t('data:table_details.other_table')}</Tag>
              ) : (
                <>
                  <Tag color="grey">{t(`data:upload_data.ftm_entity.${data.tableModel.semanticType}`)}</Tag>
                  {data.tableModel.semanticType === 'person' && data.tableModel.subEntity && (
                    <Tag color="grey">{t(`data:upload_data.ftm_entity_person.${data.tableModel.subEntity}`)}</Tag>
                  )}
                </>
              )}
              <Tag color="grey">
                {t('data:table_details.numser_of_fields', { number: data.tableModel.fields.length })}
              </Tag>
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
        tableModel={data.tableModel}
        onSave={async (tableState: SemanticTableFormValues, links: LinkValue[]) => {
          // TODO: implement save mutations
          console.log(tableState, links);
          setIsEditOpen(false);
        }}
      />
    </>
  );
}
