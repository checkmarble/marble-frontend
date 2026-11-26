import { LinksEditorContext } from '@app-builder/components/Data/shared/LinksEditorContext';
import { ftmEntities, ftmEntityPersonOptions } from '@app-builder/models';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, SelectV2, Typo } from 'ui-design-system';
import { FieldsEditorContext } from '../../shared/FieldsEditorContext';
import { DrawerContext } from './DrawerContext';
import { FieldDetailPanel } from './FieldDetailPanel';
import { FieldsForm } from './FieldsForm';
import { LinkForm } from './LinkForm';
import { type LinkValue, type TableField } from './semanticData-types';

export function FormTable({
  tableId,
  errorFieldIds,
  errorLinkIds,
  destinationTableOptions: overrideDestinationTableOptions,
}: {
  tableId: string;
  errorFieldIds?: ReadonlySet<string>;
  errorLinkIds?: ReadonlySet<string>;
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
  } = DrawerContext.useValue();
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
      sourceTableName: tableState.alias || tableState.name,
      sourceTableFields: tableState.fields,
      destinationTableOptions,
      updateLink: (linkId: string, values: Partial<LinkValue>) => updateLinkState(linkId, values),
      addLink: () => ctxAddLink(tableId),
      removeLink,
    }),
    [
      links,
      tableState.alias,
      tableState.name,
      tableState.fields,
      destinationTableOptions,
      updateLinkState,
      ctxAddLink,
      tableId,
      removeLink,
    ],
  );

  return (
    <div className="flex flex-1 min-h-0 gap-lg">
      <div className="flex flex-1 min-w-0 min-h-0 flex-col gap-lg">
        {!tableState.tableId ? (
          <section className="flex flex-col gap-md">
            <Typo variant="subtitle2">{t('data:upload_data.general_settings')}</Typo>
            <div className="flex items-center gap-md">
              <Input
                value={tableState.alias}
                onChange={(e) => updateTableState(tableId, { alias: e.currentTarget.value })}
                placeholder={t('data:upload_data.name_placeholder')}
                className="flex-1"
              />
              <SelectV2
                value={tableState.entityType}
                placeholder={t('data:upload_data.object_placeholder')}
                onChange={(value) => {
                  const nextEntityType = value;
                  updateTableState(tableId, {
                    entityType: nextEntityType,
                    subEntity: nextEntityType === 'person' ? 'moral' : 'unset',
                  });
                }}
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
          <LinkForm compact={!!selectedFieldId} errorLinkIds={errorLinkIds} hasError={Boolean(errorLinkIds?.size)} />
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
            links={links}
          />
        ) : null}
      </FieldsEditorContext.Provider>
    </div>
  );
}
