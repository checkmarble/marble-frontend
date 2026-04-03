import { type TableModel } from '@app-builder/models/data-model';
import { useDataModel } from '@app-builder/services/data/data-model';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button, cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { dataI18n } from '../../data-i18n';
import { EditTableDrawer } from '../EditTable/EditTableDrawer';
import { LinkValue, SemanticTableFormValues } from '../Shared/semanticData-types';

export interface TableDetailsProps {
  tableModel: TableModel;
  relationFieldNames: string[];
}

type TableDetailsFlowNode = Node<
  TableDetailsProps & { type: 'table_model'; state: 'initialized' | 'laid_out' | 'visible' } & Record<string, unknown>,
  'table_model'
>;

export function TableDetails({ data }: NodeProps<TableDetailsFlowNode>) {
  const { t } = useTranslation(dataI18n);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const dataModel = useDataModel();
  const relationFields = data.tableModel.fields.filter((field) => data.relationFieldNames.includes(field.name));
  const belongsToField = (fieldName: string) =>
    !!dataModel
      .flatMap((table) => table.linksToSingle)
      .find(
        (link) =>
          link.relationType === 'belongs_to' &&
          ((link.parentTableName === data.tableModel.name && link.parentFieldName === fieldName) ||
            (link.childTableName === data.tableModel.name && link.childFieldName === fieldName)),
      );

  const drawer = (
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
  );

  return (
    <>
      <div className="relative border border-grey-border rounded-lg px-v2-md py-v2-xl">
        <div className="relative flex items-center gap-v2-sm">
          <Handle
            type="target"
            id="belongs_to:header"
            position={Position.Left}
            isConnectable={false}
            style={{
              background: 'transparent',
              border: 'none',
              left: 'calc(-1 * var(--spacing-v2-md))',
            }}
          />
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
          <Handle
            type="source"
            id="belongs_to:header"
            position={Position.Right}
            isConnectable={false}
            style={{
              background: 'transparent',
              border: 'none',
              right: 'calc(-1 * var(--spacing-v2-md))',
            }}
          />
        </div>
        {relationFields.length > 0 ? (
          <div className="mt-v2-md grid gap-v2-sm">
            {relationFields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  '  bg-surface-card relative rounded-md px-v2-md py-v2-sm text-s',
                  belongsToField(field.name)
                    ? 'border-purple-primary border-2 text-purple-primary'
                    : 'border-grey-secondary borde text-grey-secondary',
                )}
              >
                <Handle
                  type="target"
                  id={`related:${field.name}`}
                  position={Position.Left}
                  isConnectable={false}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    left: 'calc(-1 * var(--spacing-v2-md))',
                  }}
                />
                <span>{field.name}</span>
                <Handle
                  type="source"
                  id={`related:${field.name}`}
                  position={Position.Right}
                  isConnectable={false}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    right: 'calc(-1 * var(--spacing-v2-md))',
                  }}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {typeof document !== 'undefined' ? createPortal(drawer, document.body) : drawer}
    </>
  );
}
