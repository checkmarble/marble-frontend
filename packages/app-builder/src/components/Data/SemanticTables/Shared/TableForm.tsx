import { LinksEditorContext } from '@app-builder/components/Data/shared/LinksEditorContext';
import { FtmEntityV2, ftmEntities, ftmEntityPersonOptions } from '@app-builder/models';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FieldsEditorContext } from '../../shared/FieldsEditorContext';
import { UploadDataDrawerContext } from '../UploadData/UploadDataDrawer';
import { FieldDetailPanel } from './FieldDetailPanel';
import { FieldsForm } from './FieldsForm';
import { LinkForm } from './LinkForm';
import { type LinkValue, type TableField } from './semanticData-types';

export function FormTable({
  tableId,
  errorFieldIds,
  destinationTableOptions: overrideDestinationTableOptions,
}: {
  tableId: string;
  errorFieldIds?: ReadonlySet<string>;
  destinationTableOptions?: { tableId: string; label: string }[];
}) {
  const {
    tablesState,
    updateTableState,
    updateLinkState,
    addLink: ctxAddLink,
    removeLink,
    getLinksForTable,
    updateField,
    reorderFields,
    addField,
    removeField,
  } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const hasSubEntity = tableState.entityType === 'person';

  const subEntityOptions = useMemo(() => {
    if (hasSubEntity) {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [hasSubEntity, t]);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const tableOptions = useMemo(
    () =>
      Object.values(tablesState)
        .filter((table) => !table.isCanceled)
        .map((table) => ({ label: table.alias || table.name, value: table.name })),
    [tablesState],
  );

  const fieldsEditorValue = useMemo(
    () => ({
      fields: tableState.fields,
      mainTimestampFieldName: tableState.mainTimestampFieldName,
      updateField: (fieldId: string, values: Partial<TableField>) => updateField(tableId, fieldId, values),
      reorderFields: (start: number, end: number) => reorderFields(tableId, start, end),
      addField: (name: string) => addField(tableId, name),
      removeField: (fieldId: string) => removeField(tableId, fieldId),
      setMainTimestampFieldName: (fieldName: string) =>
        updateTableState(tableId, { mainTimestampFieldName: fieldName }),
    }),
    [
      tableState.fields,
      tableState.mainTimestampFieldName,
      tableId,
      updateField,
      reorderFields,
      addField,
      removeField,
      updateTableState,
    ],
  );

  const links = getLinksForTable(tableId);

  const derivedDestinationTableOptions = useMemo(
    () =>
      Object.values(tablesState)
        .filter((t) => t.tableId !== tableId && !t.isCanceled)
        .map((t) => ({ tableId: t.tableId, label: t.alias || t.name })),
    [tablesState, tableId],
  );
  const destinationTableOptions = overrideDestinationTableOptions ?? derivedDestinationTableOptions;

  const linksEditorValue = useMemo(
    () => ({
      links,
      sourceTableFields: tableState.fields,
      destinationTableOptions,
      updateLink: (linkId: string, values: Partial<LinkValue>) => updateLinkState(linkId, values),
      addLink: () => ctxAddLink(tableId),
      removeLink,
    }),
    [links, tableState.fields, destinationTableOptions, updateLinkState, ctxAddLink, tableId, removeLink],
  );

  return (
    <div className="flex gap-v2-lg">
      <div className="flex min-w-0 flex-1 flex-col gap-v2-lg">
        {!tableState.tableId ? (
          <section className="flex flex-col gap-v2-md">
            <h4 className="text-m font-semibold">{t('data:upload_data.general_settings')}</h4>
            <div className="flex items-center gap-v2-md">
              <Input
                value={tableState.alias}
                onChange={(e) => updateTableState(tableId, { alias: e.currentTarget.value })}
                placeholder={t('data:upload_data.name_placeholder')}
                className="flex-1"
              />
              <SelectV2
                value={tableState.entityType}
                placeholder={t('data:upload_data.object_placeholder')}
                onChange={(value) =>
                  updateTableState(tableId, { entityType: value as FtmEntityV2, subEntity: 'moral' })
                }
                options={ftmEntityOptions}
                className="flex-1"
              />
              {hasSubEntity ? (
                <SelectV2
                  value={tableState.subEntity}
                  placeholder={t('data:upload_data.sub_object_placeholder')}
                  onChange={(value) => updateTableState(tableId, { subEntity: value as typeof tableState.subEntity })}
                  options={subEntityOptions}
                  className="flex-1"
                />
              ) : null}
            </div>
          </section>
        ) : null}
        <LinksEditorContext.Provider value={linksEditorValue}>
          <LinkForm compact={!!selectedFieldId} />
        </LinksEditorContext.Provider>
        <FieldsEditorContext.Provider value={fieldsEditorValue}>
          <FieldsForm
            onFieldSelect={setSelectedFieldId}
            selectedFieldId={selectedFieldId}
            droppableId={`fields-${tableId}`}
            errorFieldIds={errorFieldIds}
          />
        </FieldsEditorContext.Provider>
      </div>
      <FieldsEditorContext.Provider value={fieldsEditorValue}>
        {selectedFieldId ? (
          <FieldDetailPanel
            fieldId={selectedFieldId}
            onClose={() => setSelectedFieldId(null)}
            tableOptions={tableOptions}
          />
        ) : null}
      </FieldsEditorContext.Provider>
    </div>
  );
}

export function SummaryView() {
  const { tableIds } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);

  return (
    <div className="flex flex-col gap-v2-md">
      <h4 className="text-m font-semibold">{t('data:upload_data.tables_label')}</h4>
      <div className="flex flex-col gap-v2-md">
        {tableIds.map((tableId) => (
          <SummaryTableRow key={tableId} tableId={tableId} />
        ))}
      </div>
    </div>
  );
}

function SummaryTableRow({ tableId }: { tableId: string }) {
  const { tablesState, updateTableState } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const hasSubEntity = tableState.entityType === 'person';

  const subEntityOptions = useMemo(() => {
    if (hasSubEntity) {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [hasSubEntity, t]);

  return (
    <div className="flex items-center gap-v2-md">
      <div
        className={cn(
          'grid grid-cols-3 w-full items-center gap-v2-md rounded-lg border border-grey-border p-v2-md',
          tableState.isCanceled && 'opacity-50',
        )}
      >
        <Input
          value={tableState.alias}
          onChange={(e) => updateTableState(tableId, { alias: e.currentTarget.value })}
          placeholder={t('data:upload_data.name_placeholder')}
          className={cn(tableState.isCanceled && 'line-through')}
          disabled={tableState.isCanceled}
        />
        <SelectV2
          value={tableState.entityType}
          placeholder={t('data:upload_data.object_placeholder')}
          onChange={(value) => updateTableState(tableId, { entityType: value as FtmEntityV2, subEntity: 'moral' })}
          options={ftmEntityOptions}
          disabled={tableState.isCanceled}
          className={cn(!hasSubEntity && 'col-span-2')}
        />
        {hasSubEntity ? (
          <SelectV2
            value={tableState.subEntity}
            placeholder={t('data:upload_data.sub_object_placeholder')}
            onChange={(value) => updateTableState(tableId, { subEntity: value as typeof tableState.subEntity })}
            options={subEntityOptions}
            disabled={tableState.isCanceled}
          />
        ) : null}
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => updateTableState(tableId, { isCanceled: !tableState.isCanceled })}
      >
        <Icon icon={tableState.isCanceled ? 'restart-alt' : 'delete'} className="size-4" />
      </Button>
    </div>
  );
}
