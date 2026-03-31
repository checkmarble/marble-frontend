import { LinksEditorContext } from '@app-builder/components/Data/shared/LinksEditorContext';
import { useForm, useStore } from '@tanstack/react-form';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FieldsEditorContext } from '../../shared/FieldsEditorContext';
import { UploadDataDrawerContext } from '../UploadData/UploadDataDrawer';
import { FieldDetailPanel } from './FieldDetailPanel';
import { FieldsForm } from './FieldsForm';
import { LinkForm } from './LinkForm';
import {
  type FtmEntityV2,
  ftmEntities,
  ftmEntityPersonOptions,
  ftmEntityVehicleOptions,
  type LinkValue,
  type TableField,
} from './semanticData-types';

export function FormTable({ tableId }: { tableId: string }) {
  const {
    tablesState,
    updateTableState,
    updateLinkState,
    addLink: ctxAddLink,
    removeLink,
    getLinksForTable,
  } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;

  const form = useForm({
    defaultValues: tableState,
    onSubmit: ({ value }) => {
      // TODO: implement save logic
      console.log(value);
    },
  });

  // Persist form values to context on unmount (table switch)
  useEffect(() => {
    return () => {
      updateTableState(tableId, form.state.values);
    };
  }, [tableId, updateTableState, form]);

  const tableOptions = useMemo(
    () =>
      Object.values(tablesState)
        .filter((table) => !table.isCanceled)
        .map((table) => ({ label: table.alias || table.name, value: table.name })),
    [tablesState],
  );

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const selectedFtmEntity = useStore(form.store, (state) => state.values.ftmEntity);

  const subEntityOptions = useMemo(() => {
    if (selectedFtmEntity === 'person') {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    if (selectedFtmEntity === 'vehicle') {
      return ftmEntityVehicleOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_vehicle.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [selectedFtmEntity, t]);

  const hasSubEntity = selectedFtmEntity === 'person' || selectedFtmEntity === 'vehicle';

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const {
    updateField,
    reorderFields,
    addField,
    removeField,
    updateTableState: updateTable,
  } = UploadDataDrawerContext.useValue();

  const fieldsEditorValue = useMemo(
    () => ({
      fields: tableState.fields,
      mainTimestampFieldId: tableState.mainTimestampFieldId,
      updateField: (fieldId: string, values: Partial<TableField>) => updateField(tableId, fieldId, values),
      reorderFields: (start: number, end: number) => reorderFields(tableId, start, end),
      addField: (name: string) => addField(tableId, name),
      removeField: (fieldId: string) => removeField(tableId, fieldId),
      setMainTimestampFieldId: (fieldId: string) => updateTable(tableId, { mainTimestampFieldId: fieldId }),
    }),
    [
      tableState.fields,
      tableState.mainTimestampFieldId,
      tableId,
      updateField,
      reorderFields,
      addField,
      removeField,
      updateTable,
    ],
  );

  const links = getLinksForTable(tableId);

  const destinationTableOptions = useMemo(
    () =>
      Object.values(tablesState)
        .filter((t) => t.tableId !== tableId && !t.isCanceled)
        .map((t) => ({ tableId: t.tableId, label: t.alias || t.name })),
    [tablesState, tableId],
  );

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
        <section className="flex flex-col gap-v2-md">
          <h4 className="text-m font-semibold">{t('data:upload_data.general_settings')}</h4>
          <div className="flex items-center gap-v2-md">
            <form.Field name="alias">
              {(field) => (
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  placeholder={t('data:upload_data.name_placeholder')}
                  className="flex-1"
                />
              )}
            </form.Field>
            <form.Field name="ftmEntity">
              {(field) => (
                <SelectV2
                  value={field.state.value}
                  placeholder={t('data:upload_data.object_placeholder')}
                  onChange={(value) => {
                    field.handleChange(value as FtmEntityV2);
                    form.setFieldValue('ftmSubEntity', '');
                  }}
                  options={ftmEntityOptions}
                  className="flex-1"
                />
              )}
            </form.Field>
            {hasSubEntity ? (
              <form.Field name="ftmSubEntity">
                {(field) => (
                  <SelectV2
                    value={field.state.value}
                    placeholder={t('data:upload_data.sub_object_placeholder')}
                    onChange={field.handleChange}
                    options={subEntityOptions}
                    className="flex-1"
                  />
                )}
              </form.Field>
            ) : null}
          </div>
        </section>
        <LinksEditorContext.Provider value={linksEditorValue}>
          <LinkForm compact={!!selectedFieldId} />
        </LinksEditorContext.Provider>
        <FieldsEditorContext.Provider value={fieldsEditorValue}>
          <FieldsForm
            onFieldSelect={setSelectedFieldId}
            selectedFieldId={selectedFieldId}
            droppableId={`fields-${tableId}`}
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

  const form = useForm({
    defaultValues: tableState,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  // Sync form -> context on every change
  const formValues = useStore(form.store, (state) => state.values);
  useEffect(() => {
    updateTableState(tableId, formValues);
  }, [tableId, formValues, updateTableState]);

  const ftmEntityOptions = useMemo(
    () =>
      ftmEntities.map((entity) => ({
        label: t(`data:upload_data.ftm_entity.${entity}`),
        value: entity,
      })),
    [t],
  );

  const selectedFtmEntity = useStore(form.store, (state) => state.values.ftmEntity);

  const subEntityOptions = useMemo(() => {
    if (selectedFtmEntity === 'person') {
      return ftmEntityPersonOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_person.${sub}`),
        value: sub,
      }));
    }
    if (selectedFtmEntity === 'vehicle') {
      return ftmEntityVehicleOptions.map((sub) => ({
        label: t(`data:upload_data.ftm_entity_vehicle.${sub}`),
        value: sub,
      }));
    }
    return [];
  }, [selectedFtmEntity, t]);

  const hasSubEntity = selectedFtmEntity === 'person' || selectedFtmEntity === 'vehicle';

  return (
    <div className="flex items-center gap-v2-md">
      <div
        className={cn(
          'grid grid-cols-3 w-full items-center gap-v2-md rounded-lg border border-grey-border p-v2-md',
          tableState.isCanceled && 'opacity-50',
        )}
      >
        <form.Field name="alias">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder={t('data:upload_data.name_placeholder')}
              className={cn(tableState.isCanceled && 'line-through')}
              disabled={tableState.isCanceled}
            />
          )}
        </form.Field>
        <form.Field name="ftmEntity">
          {(field) => (
            <SelectV2
              value={field.state.value}
              placeholder={t('data:upload_data.object_placeholder')}
              onChange={(value) => {
                field.handleChange(value as FtmEntityV2);
                form.setFieldValue('ftmSubEntity', '');
              }}
              options={ftmEntityOptions}
              disabled={tableState.isCanceled}
              className={cn(!hasSubEntity && 'col-span-2')}
            />
          )}
        </form.Field>
        {hasSubEntity ? (
          <form.Field name="ftmSubEntity">
            {(field) => (
              <SelectV2
                value={field.state.value}
                placeholder={t('data:upload_data.sub_object_placeholder')}
                onChange={field.handleChange}
                options={subEntityOptions}
                disabled={tableState.isCanceled}
              />
            )}
          </form.Field>
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
