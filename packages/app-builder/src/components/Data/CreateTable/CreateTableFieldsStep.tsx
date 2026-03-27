import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldsEditorContext } from '../shared/FieldsEditorContext';
import { FieldDetailPanel } from '../UploadData/FieldDetailPanel';
import { FieldsForm } from '../UploadData/FieldsForm';
import type { TableField } from '../UploadData/uploadData-types';
import { useCreateTableFormContext } from './CreateTableDrawer';

export function CreateTableFieldsStep() {
  const { t } = useTranslation(['data']);
  const form = useCreateTableFormContext();
  const fields = useStore(form.store, (s) => s.values.fields);
  const mainTimestampFieldId = useStore(form.store, (s) => s.values.mainTimestampFieldId);
  const entityType = useStore(form.store, (s) => s.values.entityType);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

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
        return next.map((f, i) => ({ ...f, order: i }));
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
          tableId: '',
          isEnum: false,
          nullable: true,
          alias: name,
          visible: true,
          hidden: false,
          order: prev.length,
          unicityConstraint: 'no_unicity_constraint',
          ftmProperty: '',
          isNew: true,
        },
      ]);
      return fieldId;
    },
    [form],
  );

  const removeField = useCallback(
    (fieldId: string) => {
      form.setFieldValue('fields', (prev) => prev.filter((f) => f.id !== fieldId).map((f, i) => ({ ...f, order: i })));
      if (selectedFieldId === fieldId) setSelectedFieldId(null);
    },
    [form, selectedFieldId],
  );

  const setMainTimestampFieldId = useCallback(
    (fieldId: string) => {
      form.setFieldValue('mainTimestampFieldId', fieldId);
    },
    [form],
  );

  const editorValue = useMemo(
    () => ({
      fields,
      mainTimestampFieldId,
      updateField,
      reorderFields,
      addField,
      removeField,
      setMainTimestampFieldId,
    }),
    [fields, mainTimestampFieldId, updateField, reorderFields, addField, removeField, setMainTimestampFieldId],
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
