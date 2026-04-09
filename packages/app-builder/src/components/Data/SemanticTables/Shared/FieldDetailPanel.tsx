import { useDataModel, useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, NumberInput, type SelectOption, SelectV2, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DataField } from '../../DataVisualisation/DataField';
import { isValidDataModelName } from '../../shared/dataModelNameValidation';
import { FieldsEditorContext } from '../../shared/FieldsEditorContext';
import { useDatatypeOptions } from './DatatypeOption';
import {
  type DataTypeKey,
  type EnumColors,
  enumColors,
  getMockValue,
  getSemanticSubOptions,
  type LinkValue,
  type SemanticSubTypeField,
  SemanticTypeField,
  semanticTypesByDataType,
  type TableField,
} from './semanticData-types';

export function FieldDetailPanel({
  fieldId,
  onClose,
  title,
  tableOptions,
  links,
  removeLink,
}: {
  fieldId: string;
  onClose: () => void;
  title?: string;
  tableOptions?: { label: string; value: string }[];
  links?: LinkValue[];
  removeLink?: (linkId: string) => void;
}) {
  const { fields, updateField, removeField, mainTimestampFieldName, setMainTimestampFieldName } =
    FieldsEditorContext.useValue();
  const dataModel = useDataModel();
  const { isEditDataModelInfoAvailable, isDeleteDataModelFieldAvailable } = useDataModelFeatureAccess();

  const { t } = useTranslation(['data', 'common']);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const field = fields.find((f) => f.id === fieldId);

  const typeSelectRef = useRef<HTMLButtonElement>(null);
  const aliasInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (field?.isNew) {
      typeSelectRef.current?.focus();
    } else {
      aliasInputRef.current?.focus();
    }
  }, [fieldId]); // eslint-disable-line react-hooks/exhaustive-deps

  const isNameDuplicate = useMemo(() => {
    if (!field) return false;
    return fields.some((f) => f.id !== fieldId && f.name === field.name);
  }, [field, fieldId, fields]);

  const typeSelectOptions = useDatatypeOptions();

  const resolvedTableOptions = useMemo(() => {
    const dataModelTableOptions = dataModel.map((table) => ({
      label: table.alias || table.name,
      value: table.name,
    }));

    return [...dataModelTableOptions, ...(tableOptions ?? [])].filter(
      (option, index, allOptions) => allOptions.findIndex(({ value }) => value === option.value) === index,
    );
  }, [dataModel, tableOptions]);

  const semanticOptions = useMemo(() => {
    if (!field) return [];
    const options = semanticTypesByDataType[field.dataType as keyof typeof semanticTypesByDataType];
    if (!options) return [];
    return options
      .filter((opt) => opt.value !== 'foreign_key' || resolvedTableOptions.length > 0)
      .map(
        (opt): SelectOption<SemanticTypeField> => ({
          label: t(`data:upload_data.field_semantic.${opt.value}`),
          value: opt.value,
        }),
      );
  }, [field, resolvedTableOptions.length, t]);

  const semanticSubOptions = useMemo(() => {
    if (!field || !field.semanticType) return [];
    const subOpts = getSemanticSubOptions(field.dataType as DataTypeKey, field.semanticType as SemanticTypeField);
    if (!subOpts) return [];
    return subOpts.map(
      (opt): SelectOption<SemanticSubTypeField> => ({
        label: t(`data:upload_data.field_semantic_sub.${opt.value}`),
        value: opt.value as SemanticSubTypeField,
      }),
    );
  }, [field, t]);

  const currencyFieldOptions = useMemo(
    () =>
      fields
        .filter((f) => f.id !== fieldId && f.semanticType === 'currency_code')
        .map((f) => ({ label: f.alias || f.name, value: f.id })),
    [fields, fieldId],
  );
  const linkedLinks = useMemo(
    () => (links ?? []).filter((l) => l.tableFieldId === field?.name || l.tableFieldId === fieldId),
    [links, field?.name, fieldId],
  );

  if (!field) return null;

  const isLocked = field.locked ?? false;
  const canDeleteField = (field.isNew || isDeleteDataModelFieldAvailable) && !field.locked;

  function update(values: Partial<TableField>) {
    if (isEditDataModelInfoAvailable) updateField(fieldId, values);
  }

  function handleDeleteClick() {
    if (linkedLinks.length > 0) {
      setConfirmDeleteOpen(true);
    } else {
      performDelete();
    }
  }

  function performDelete() {
    if (!canDeleteField) return;
    if (field?.name === mainTimestampFieldName) {
      setMainTimestampFieldName('updated_at');
    }
    removeField(fieldId);
    for (const link of linkedLinks) {
      removeLink?.(link.linkId);
    }
    onClose();
  }

  const mockedValue = getMockValue(field.dataType, field.semanticType, field.semanticSubType);

  return (
    <>
      <div className="flex w-1/2 shrink-0 flex-col border-l border-grey-border overflow-y-auto">
        <div className="flex items-center justify-between p-v2-md border-b border-grey-border">
          <div className="flex items-center gap-v2-sm">
            <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-grey-border">
              <Icon icon="x" className="size-4" />
            </button>
            <h4 className="text-m font-semibold">{title ?? t('data:upload_data.field_detail_title')}</h4>
          </div>
          {canDeleteField ? (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="rounded-lg p-1 text-grey-secondary hover:bg-grey-border hover:text-red-primary"
            >
              <Icon icon="delete" className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-v2-lg p-v2-lg">
          {/* Type of the field */}
          <div className="flex flex-col gap-v2-xs">
            <label className="text-s text-grey-secondary">{t('data:upload_data.field_type_label')}</label>
            <SelectV2
              ref={typeSelectRef}
              value={field.dataType}
              placeholder=""
              onChange={(value) => update({ dataType: value, semanticType: undefined, semanticSubType: undefined })}
              options={typeSelectOptions}
              disabled={isLocked || !field.isNew}
            />
          </div>

          {/* Name of the field */}
          <div className="flex flex-col gap-v2-xs">
            <label className="text-s text-grey-secondary">{t('data:upload_data.field_name_label')}</label>
            <Input
              value={field.name}
              onChange={(e) => update({ name: e.currentTarget.value })}
              disabled={isLocked || !field.isNew}
            />
            {isNameDuplicate ? (
              <p className="text-xs text-red-primary">{t('data:upload_data.field_name_unique_error')}</p>
            ) : null}
            {!field.name ? (
              <p className="text-xs text-red-primary">{t('data:upload_data.field_name_required_error')}</p>
            ) : null}
            {field.name && !isValidDataModelName(field.name) ? (
              <p className="text-xs text-red-primary">{t('data:create_field.name_regex_error')}</p>
            ) : null}
          </div>

          {/* Alias */}
          <div className="flex flex-col gap-v2-xs">
            <label className="text-s text-grey-secondary">{t('data:upload_data.field_alias')}</label>
            <Input ref={aliasInputRef} value={field.alias} onChange={(e) => update({ alias: e.currentTarget.value })} />
          </div>

          {/* Advanced settings */}
          <div className="flex flex-col gap-v2-md">
            <h5 className="text-s font-medium text-grey-secondary">{t('data:upload_data.field_advanced_settings')}</h5>

            {/* Description */}
            <div className="flex flex-col gap-v2-xs">
              <label className="text-s text-grey-secondary">{t('data:upload_data.field_description_label')}</label>
              <Input
                value={field.description}
                onChange={(e) => update({ description: e.currentTarget.value })}
                placeholder={t('data:upload_data.field_description_placeholder')}
              />
            </div>

            {/* Required */}
            <label className="flex items-center gap-v2-sm cursor-pointer">
              <Switch
                checked={!field.nullable}
                onCheckedChange={(checked) => update({ nullable: !checked })}
                disabled={isLocked}
              />
              <span className="text-s">{t('data:upload_data.field_required')}</span>
            </label>

            {/* Hidden */}
            <label className="flex items-center gap-v2-sm cursor-pointer">
              <Switch checked={field.hidden} onCheckedChange={(checked) => update({ hidden: checked })} />
              <span className="text-s">{t('data:upload_data.field_hidden')}</span>
            </label>
          </div>

          {/* Semantic type */}
          {semanticOptions.length > 0 ? (
            <div className="flex flex-col gap-v2-xs">
              <label className="text-s text-grey-secondary">{t('data:upload_data.field_semantic_type')}</label>
              <SelectV2
                value={field.semanticType}
                placeholder={t('data:upload_data.field_semantic_placeholder')}
                onChange={(value) => {
                  const newSemanticType = value as SemanticTypeField;
                  const subOpts = getSemanticSubOptions(field.dataType as DataTypeKey, newSemanticType);
                  const isCurrentSubTypeValid = subOpts?.some((opt) => opt.value === field.semanticSubType) ?? false;
                  const firstSubType = subOpts?.[0]?.value as SemanticSubTypeField | undefined;
                  update({
                    semanticType: newSemanticType,
                    semanticSubType: isCurrentSubTypeValid ? field.semanticSubType : firstSubType,
                  });
                }}
                options={semanticOptions}
                disabled={isLocked}
              />
            </div>
          ) : null}

          {/* Semantic sub-type */}
          {semanticSubOptions.length > 0 ? (
            <div className="flex flex-col gap-v2-xs">
              <label className="text-s text-grey-secondary">{t('data:upload_data.field_semantic_sub_type')}</label>
              <SelectV2
                value={field.semanticSubType}
                placeholder=""
                onChange={(value) => update({ semanticSubType: value as SemanticSubTypeField })}
                options={semanticSubOptions}
                disabled={isLocked}
              />
            </div>
          ) : null}

          {/* ForeignKey-specific: destination table */}
          {field.semanticType === 'foreign_key' ? (
            <ForeignKeySettings
              foreignkeyTable={field.foreignkeyTable}
              onChange={update}
              tableOptions={resolvedTableOptions}
              disabled={isLocked}
            />
          ) : null}

          {/* Currency-specific: currency exponent (only when semantic type is number and sub type is currency) */}
          {field.semanticType === 'monetary_amount' ? (
            <CurrencySettings
              field={field}
              currencyFieldOptions={currencyFieldOptions}
              onChange={update}
              disabled={isLocked}
            />
          ) : null}

          {/* Enum-specific: key/color/value list */}
          {field.semanticType === 'enum' && field.semanticSubType === 'key_color_value' ? (
            <EnumValuesSettings field={field} onChange={update} disabled={isLocked} />
          ) : null}

          {/* Boolean-specific: display as switch or yes/no */}
          {field.dataType === 'Bool' ? (
            <BooleanSettings booleanDisplay={field.booleanDisplay} onChange={update} disabled={isLocked} />
          ) : null}

          {/* Timestamp-specific: main ordering timestamp (only one per table) */}
          {field.dataType === 'Timestamp' ? (
            <TimestampSettings
              fieldName={field.name}
              mainTimestampFieldName={mainTimestampFieldName}
              setMainTimestampFieldName={setMainTimestampFieldName}
              disabled={isLocked}
            />
          ) : null}

          {/* Example of visual in Marble */}
          <div className="flex flex-col gap-v2-xs">
            <label className="text-s text-grey-secondary italic">{t('data:upload_data.field_visual_example')}</label>
            <div className="rounded-lg border border-grey-border bg-grey-98 p-v2-md">
              <div className="flex flex-col gap-v2-md">
                <div className="p-v2-xs rounded border border-grey-border font-mono w-full text-xs text-grey-secondary">
                  <span>{`${t('data:upload_data.raw_data')} { "${field.name}": ${typeof mockedValue === 'string' ? '"' : ''}${mockedValue}${typeof mockedValue === 'string' ? '"' : ''}}`}</span>
                </div>
                <DataField
                  field={{
                    id: field.id,
                    dataType: field.dataType,
                    description: field.description,
                    isEnum: false,
                    name: field.alias || field.name,
                    nullable: field.nullable,
                    tableId: 'id',
                    unicityConstraint: 'no_unicity_constraint',
                    semanticType: field.semanticType,
                    semanticSubType: field.semanticSubType,
                    currencyExponent: field.currencyExponent,
                    decimalPrecision: field.decimalPrecision,
                    currencyFieldId: field.currencyFieldId,
                    booleanDisplay: field.booleanDisplay,
                    foreignkeyTable: field.foreignkeyTable,
                  }}
                  value={mockedValue}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal.Root open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <Modal.Content>
          <Modal.Title>{t('data:delete_field.title', { name: field.alias || field.name })}</Modal.Title>
          <div className="p-6">
            <p className="text-s text-grey-primary">
              {t('data:delete_field.confirm_with_links', {
                linkNames: linkedLinks.map((l) => l.name).join(', '),
              })}
            </p>
          </div>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button variant="secondary" appearance="stroked">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button variant="primary" onClick={performDelete}>
              {t('common:delete')}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}

function CurrencySettings({
  field,
  currencyFieldOptions,
  onChange,
  disabled,
}: {
  field: TableField;
  currencyFieldOptions: { label: string; value: string }[];
  onChange: (values: Partial<TableField>) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation(['data']);
  return (
    <div className="flex flex-col gap-v2-sm rounded-lg border border-grey-border p-v2-md">
      <span className="text-s text-grey-secondary">{t('data:upload_data.field_currency_settings')}</span>
      {currencyFieldOptions.length > 0 ? (
        <div className="flex flex-col gap-v2-xs">
          <label className="text-s text-grey-secondary">{t('data:upload_data.field_currency_field')}</label>
          <SelectV2
            value={field.currencyFieldId}
            placeholder={t('data:upload_data.field_currency_field_placeholder')}
            onChange={(value) => onChange({ currencyFieldId: value })}
            options={currencyFieldOptions}
            disabled={disabled}
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-v2-xs">
        <label className="text-s text-grey-secondary">{t('data:upload_data.field_currency_exponent')}</label>
        <NumberInput
          min={0}
          max={10}
          value={field.currencyExponent ?? 0}
          onChange={(value) => onChange({ currencyExponent: Math.min(10, Math.max(0, value)) })}
          disabled={disabled}
        />
      </div>
      <div className="flex flex-col gap-v2-xs">
        <label className="text-s text-grey-secondary">{t('data:upload_data.field_decimal_precision')}</label>
        <NumberInput
          min={0}
          max={10}
          value={field.decimalPrecision ?? 2}
          onChange={(value) => onChange({ decimalPrecision: Math.min(10, Math.max(0, value)) })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function BooleanSettings({
  booleanDisplay,
  onChange,
  disabled,
}: {
  booleanDisplay?: 'yes_no' | 'checkbox';
  onChange: (values: Partial<TableField>) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation(['data']);
  const options = [
    { label: t('data:upload_data.field_boolean_display_switch'), value: 'checkbox' },
    { label: t('data:upload_data.field_boolean_display_yes_no'), value: 'yes_no' },
  ] as const;
  return (
    <div className="flex flex-col gap-v2-sm rounded-lg border border-grey-border p-v2-md">
      <span className="text-s text-grey-secondary">{t('data:upload_data.field_boolean_settings')}</span>
      <div className="flex gap-v2-sm">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ booleanDisplay: opt.value })}
            className={`flex-1 rounded-lg border px-v2-sm py-v2-xs text-s transition-colors ${
              (booleanDisplay ?? 'checkbox') === opt.value
                ? 'border-purple-primary bg-purple-10 text-purple-primary'
                : 'border-grey-border text-grey-secondary hover:bg-grey-border'
            }`}
            disabled={disabled}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ForeignKeySettings({
  foreignkeyTable,
  onChange,
  tableOptions,
  disabled,
}: {
  foreignkeyTable?: string;
  onChange: (values: Partial<TableField>) => void;
  tableOptions: { label: string; value: string }[];
  disabled: boolean;
}) {
  const { t } = useTranslation(['data']);

  return (
    <div className="flex flex-col gap-v2-sm rounded-lg border border-grey-border p-v2-md">
      <span className="text-s text-grey-secondary">{t('data:upload_data.field_foreign_key_settings')}</span>
      <SelectV2
        value={foreignkeyTable}
        placeholder={t('data:upload_data.field_foreign_key_placeholder')}
        onChange={(value) => onChange({ foreignkeyTable: value })}
        options={tableOptions}
        disabled={disabled}
      />
      {!foreignkeyTable ? (
        <p className="text-xs text-red-primary">{t('data:upload_data.field_foreign_key_required_error')}</p>
      ) : null}
    </div>
  );
}

function toSnakeCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function EnumValuesSettings({
  field,
  onChange,
  disabled,
}: {
  field: TableField;
  onChange: (values: Partial<TableField>) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation(['data']);
  const enumValues = field.enumValues ?? [];

  const colorOptions = useMemo(
    () =>
      enumColors.map((color) => ({
        value: color,
        label: (
          <div className="size-4 rounded-full border border-grey-border" style={{ backgroundColor: color }}>
            &nbsp;
          </div>
        ),
      })),
    [],
  );

  function addValue() {
    onChange({ enumValues: [...enumValues, { key: '', color: 'gray', value: '' }] });
  }

  function updateValue(index: number, patch: Partial<{ key: string; color: EnumColors; value: string }>) {
    const newValues = enumValues.map((v, i) => {
      if (i !== index) return v;
      const newValue = patch.value !== undefined ? patch.value : v.value;
      return {
        key: patch.value !== undefined ? toSnakeCase(patch.value) : (patch.key ?? v.key),
        color: patch.color ?? v.color,
        value: newValue,
      };
    });
    onChange({ enumValues: newValues });
  }

  function removeValue(index: number) {
    onChange({ enumValues: enumValues.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-v2-sm rounded-lg border border-grey-border p-v2-md">
      <span className="text-s text-grey-secondary">{t('data:upload_data.field_enum_settings')}</span>
      <div className="flex flex-col gap-v2-sm">
        {enumValues.map((enumValue, index) => {
          const isDuplicate =
            enumValue.value !== '' && enumValues.some((v, i) => i !== index && v.value === enumValue.value);
          return (
            <div key={index} className="flex flex-col gap-v2-xs">
              <div className="flex items-center gap-v2-sm">
                <div className="w-max shrink-0">
                  <SelectV2
                    value={enumValue.color}
                    placeholder=""
                    onChange={(value) => updateValue(index, { color: value as EnumColors })}
                    options={colorOptions}
                    disabled={disabled}
                  />
                </div>
                <Input
                  className="flex-1"
                  value={enumValue.value}
                  placeholder={t('data:upload_data.field_enum_value_placeholder')}
                  onChange={(e) => updateValue(index, { value: e.currentTarget.value })}
                  disabled={disabled}
                />
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="shrink-0 rounded-lg p-1 text-grey-secondary hover:bg-grey-border hover:text-red-primary"
                  disabled={disabled}
                >
                  <Icon icon="delete" className="size-4" />
                </button>
              </div>
              {isDuplicate ? (
                <p className="text-xs text-red-primary">{t('data:upload_data.field_enum_value_unique_error')}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <Button variant="secondary" appearance="stroked" onClick={addValue} disabled={disabled}>
        <Icon icon="plus" className="size-4" />
        {t('data:upload_data.field_enum_add_value')}
      </Button>
    </div>
  );
}

function TimestampSettings({
  fieldName,
  mainTimestampFieldName,
  setMainTimestampFieldName,
  disabled,
}: {
  fieldName: string;
  mainTimestampFieldName: string;
  setMainTimestampFieldName: (id: string) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation(['data']);
  return (
    <div className="flex flex-col gap-v2-sm rounded-lg border border-grey-border p-v2-md">
      <span className="text-s text-grey-secondary">{t('data:upload_data.field_timestamp_settings')}</span>
      <label className="flex items-center gap-v2-sm cursor-pointer">
        <Switch
          checked={mainTimestampFieldName === fieldName}
          onCheckedChange={(checked) => setMainTimestampFieldName(checked ? fieldName : 'updated_at')}
          disabled={disabled}
        />
        <span className="text-s">{t('data:upload_data.field_main_ordering_timestamp')}</span>
      </label>
    </div>
  );
}
