import { useDataModel } from '@app-builder/services/data/data-model';
import { useStore } from '@tanstack/react-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldsEditorContext } from '../../shared/FieldsEditorContext';
import { FieldDetailPanel } from '../Shared/FieldDetailPanel';
import { FieldsForm } from '../Shared/FieldsForm';
import type { TableField } from '../Shared/semanticData-types';
import { useCreateTableFormContext } from './CreateTableContext';

export function CreateTableFieldsStep({
  errorFieldIds,
  hasError,
}: {
  errorFieldIds?: ReadonlySet<string>;
  hasError?: boolean;
}) {
  const { t } = useTranslation(['data']);
  const form = useCreateTableFormContext();
  const dataModel = useDataModel();
  const fields = useStore(form.store, (s) => s.values.fields);
  const mainTimestampFieldName = useStore(form.store, (s) => s.values.mainTimestampFieldName);
  const entityType = useStore(form.store, (s) => s.values.entityType);
  const belongsToTableId = useStore(form.store, (s) => s.values.belongsToTableId);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const belongsToTableName = useMemo(
    () => dataModel.find((table) => table.id === belongsToTableId)?.name,
    [belongsToTableId, dataModel],
  );

  useEffect(() => {
    form.setFieldValue('fields', (prev) => {
      // Remove any previously auto-added FK field
      const withoutDefault = prev.filter((field) => !field.isDefaultBelongsTo);

      if (!belongsToTableName) return withoutDefault;

      const fieldName = `${belongsToTableName}_id`;
      const hasExistingForeignKeyField = withoutDefault.some(
        (field) => field.name === fieldName || field.foreignkeyTable === belongsToTableName,
      );
      if (hasExistingForeignKeyField) return withoutDefault;

      const defaultForeignKeyField: TableField = {
        id: crypto.randomUUID(),
        name: fieldName,
        description: '',
        dataType: 'String',
        tableId: '',
        isEnum: false,
        nullable: true,
        alias: fieldName,
        hidden: false,
        unicityConstraint: 'no_unicity_constraint',
        semanticType: 'foreign_key',
        foreignkeyTable: belongsToTableName,
        isDefaultBelongsTo: true,
        isNew: true,
      };

      return [...withoutDefault, defaultForeignKeyField];
    });
  }, [belongsToTableName, form]);

  const updateField = useCallback(
    (fieldId: string, values: Partial<TableField>) => {
      form.setFieldValue('fields', (prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...values } : f)));
    },
    [form],
  );

  const reorderFields = useCallback(
    (startIndex: number, endIndex: number) => {
      form.setFieldValue('fields', (prev) => {
        const next = [...prev];
        const [moved] = next.splice(startIndex, 1);
        next.splice(endIndex, 0, moved!);
        return next;
      });
    },
    [form],
  );

  const addField = useCallback(
    (name: string): string => {
      const fieldId = crypto.randomUUID();
      form.setFieldValue('fields', (prev) => [
        ...prev,
        {
          id: fieldId,
          name,
          description: '',
          dataType: 'String' as const,
          isEnum: false,
          nullable: true,
          alias: name,
          hidden: false,
          unicityConstraint: 'no_unicity_constraint',
          isNew: true,
          semanticType: 'text' as const,
          tableId: '',
        },
      ]);
      return fieldId;
    },
    [form],
  );

  const removeField = useCallback(
    (fieldId: string) => {
      form.setFieldValue('fields', (prev) => prev.filter((f) => f.id !== fieldId));
      if (selectedFieldId === fieldId) setSelectedFieldId(null);
    },
    [form, selectedFieldId],
  );

  const setMainTimestampFieldName = useCallback(
    (fieldName: string) => {
      form.setFieldValue('mainTimestampFieldName', fieldName);
    },
    [form],
  );

  const editorValue = useMemo(
    () => ({
      fields,
      mainTimestampFieldName,
      updateField,
      reorderFields,
      addField,
      removeField,
      setMainTimestampFieldName,
    }),
    [fields, mainTimestampFieldName, updateField, reorderFields, addField, removeField, setMainTimestampFieldName],
  );

  const title = entityType
    ? t('data:create_table.suggested_fields_title', {
        entity: t(`data:upload_data.ftm_entity.${entityType}`),
      })
    : t('data:create_table.suggested_fields_title_default');

  return (
    <FieldsEditorContext.Provider value={editorValue}>
      <div className="flex gap-v2-lg">
        <div className="flex min-w-0 flex-1 flex-col gap-v2-lg">
          <FieldsForm
            onFieldSelect={setSelectedFieldId}
            selectedFieldId={selectedFieldId}
            title={title}
            description={t('data:create_table.suggested_fields_description')}
            droppableId="create-table-fields"
            errorFieldIds={errorFieldIds}
            hasError={hasError}
          />
        </div>
        {selectedFieldId ? (
          <FieldDetailPanel
            fieldId={selectedFieldId}
            onClose={() => setSelectedFieldId(null)}
            title={t('data:create_table.detailed_setup_title')}
          />
        ) : null}
      </div>
    </FieldsEditorContext.Provider>
  );
}
