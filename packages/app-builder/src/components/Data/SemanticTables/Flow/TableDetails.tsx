import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type TableModel } from '@app-builder/models/data-model';
import { useEditSemanticTableMutation } from '@app-builder/queries/data/edit-semantic-table';
import { useDataModel, useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DeleteTableModal } from '../../DeleteDataModel/DeleteTableModal';
import { dataI18n } from '../../data-i18n';
import { EditTableDrawer } from '../EditTable/EditTableDrawer';
import { adaptUpdateTableValue } from '../EditTable/updateTable-adapter';
import { ChangeRecord, LinkValue, SemanticTableFormValues } from '../Shared/semanticData-types';
import { UploadTableDrawer } from '../UploadData/UploadTableDrawer';
import { TableRecordPreviewDrawer } from './TableRecordPreviewDrawer';

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dataModel = useDataModel();
  const { isIngestDataAvailable } = useDataModelFeatureAccess();

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

  const selfRefLinks = data.tableModel.linksToSingle.filter(
    (link) => link.parentTableId === link.childTableId && link.relationType === 'belongs_to',
  );
  const selfRefPartner = new Map<string, string>();
  for (const link of selfRefLinks) {
    selfRefPartner.set(link.parentFieldName, link.childFieldName);
    selfRefPartner.set(link.childFieldName, link.parentFieldName);
  }

  type FieldGroup =
    | { type: 'single'; field: (typeof relationFields)[0] }
    | { type: 'pair'; fields: [(typeof relationFields)[0], (typeof relationFields)[0]] };
  const fieldGroups: FieldGroup[] = [];
  const consumed = new Set<string>();
  for (const field of relationFields) {
    if (consumed.has(field.name)) continue;
    const partnerName = selfRefPartner.get(field.name);
    if (partnerName) {
      const partner = relationFields.find((f) => f.name === partnerName);
      if (partner) {
        fieldGroups.push({ type: 'pair', fields: [field, partner] });
        consumed.add(field.name);
        consumed.add(partnerName);
        continue;
      }
    }
    fieldGroups.push({ type: 'single', field });
    consumed.add(field.name);
  }

  const renderField = (field: (typeof relationFields)[0]) => (
    <div
      key={field.id}
      className={cn(
        'bg-surface-card relative rounded-md px-v2-md py-v2-sm text-s',
        belongsToField(field.name)
          ? 'border-purple-primary border-2 text-purple-primary'
          : 'border-grey-secondary border text-grey-secondary',
      )}
    >
      <Handle
        type="target"
        id={`related:${field.name}`}
        position={Position.Left}
        isConnectable={false}
        style={{ background: 'transparent', border: 'none', left: 'calc(-1 * var(--spacing-v2-md))' }}
      />
      <span title={field.name}>{field.alias || field.name}</span>
      <Handle
        type="source"
        id={`related:${field.name}`}
        position={Position.Right}
        isConnectable={false}
        style={{ background: 'transparent', border: 'none', right: 'calc(-1 * var(--spacing-v2-md))' }}
      />
    </div>
  );

  const updateTableMutation = useEditSemanticTableMutation();
  const revalidate = useLoaderRevalidator();

  const drawer = (
    <>
      <EditTableDrawer
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        tableModel={data.tableModel}
        onSave={async (
          tableState: SemanticTableFormValues,
          changeSet: ChangeRecord[],
          initialTableState: SemanticTableFormValues,
          initialLinks: LinkValue[],
        ) => {
          const tableNameById = new Map(dataModel.map((t) => [t.id, t.name]));
          await updateTableMutation
            .mutateAsync(
              adaptUpdateTableValue(tableState, changeSet, initialTableState.fields, initialLinks, tableNameById),
            )
            .then(() => {
              toast.success(t('data:table_details.table_updated', { name: tableState.alias || tableState.name }));
              revalidate();
              setIsEditOpen(false);
            });
        }}
      />
      <DeleteTableModal table={data.tableModel} open={isDeleteOpen} onOpenChange={setIsDeleteOpen} />
      <TableRecordPreviewDrawer open={isPreviewOpen} onOpenChange={setIsPreviewOpen} tableName={data.tableModel.name} />
      <UploadTableDrawer
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        tableName={data.tableModel.name}
        tableModel={data.tableModel}
      />
    </>
  );

  return (
    <>
      <div className="relative border border-purple-border-light bg-purple-background-light rounded-lg px-v2-md py-v2-xl">
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
            <h4 className="font-semibold text-purple-primary" title={data.tableModel.name}>
              {data.tableModel.alias || data.tableModel.name}
            </h4>
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
                {t('data:table_details.number_of_fields', { number: data.tableModel.fields.length })}
              </Tag>
            </div>
          </div>
          <MenuCommand.Menu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <MenuCommand.Trigger>
              <Button variant="secondary" appearance="stroked" aria-label={t('data:table_details.actions')}>
                <Icon icon="more-menu" className="text-purple-primary size-4" />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content align="end" sideOffset={4} size="small">
              <MenuCommand.List>
                <MenuCommand.Item onSelect={() => setIsEditOpen(true)}>
                  <div className="flex items-center gap-v2-xs">
                    <Icon icon="edit-square" className="size-4" />
                    {t('data:edit_table.menu_label')}
                  </div>
                </MenuCommand.Item>
                <MenuCommand.Item onSelect={() => setIsDeleteOpen(true)}>
                  <div className="flex items-center gap-v2-xs">
                    <Icon icon="delete" className="size-4" />
                    {t('data:delete_table.menu_label')}
                  </div>
                </MenuCommand.Item>
                <MenuCommand.Separator />
                <MenuCommand.Item disabled={!isIngestDataAvailable} onSelect={() => setIsUploadOpen(true)}>
                  <div className="flex items-center gap-v2-xs">
                    <Icon icon="upload" className="size-4" />
                    {t('data:upload_data.title')}
                  </div>
                </MenuCommand.Item>
                <MenuCommand.Item onSelect={() => setIsPreviewOpen(true)}>
                  <div className="flex items-center gap-v2-xs">
                    <Icon icon="visibility" className="size-4" />
                    {t('data:viewer.view_ingested_data')}
                  </div>
                </MenuCommand.Item>
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
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
          <div className="mt-v2-md flex flex-col gap-v2-sm">
            {fieldGroups.map((group) => {
              if (group.type === 'pair') {
                return (
                  <div key={`${group.fields[0].id}-${group.fields[1].id}`} className="relative flex flex-col gap-v2-sm">
                    <div className="absolute -left-2 top-5 bottom-5 w-2 border-l-2 border-t-2 border-b-2 rounded-l border-purple-primary" />
                    {group.fields.map((field) => renderField(field))}
                  </div>
                );
              }
              return renderField(group.field);
            })}
          </div>
        ) : null}
      </div>
      {typeof document !== 'undefined' ? createPortal(drawer, document.body) : drawer}
    </>
  );
}
