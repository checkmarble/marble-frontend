import { type DataType, getDataTypeIcon } from '@app-builder/models';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, NumberInput, SelectV2, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DataField } from '../DataVisualisation/DataField';
import { UploadDataDrawerContext } from './Drawer';
import {
  type DataTypeKey,
  getMockValue,
  getSemanticSubOptions,
  SemanticSubType,
  type SemanticType,
  semanticTypesByDataType,
} from './uploadData-types';

const dataTypeOptions: { value: DataType; labelKey: string }[] = [
  { value: 'String', labelKey: 'String' },
  { value: 'Timestamp', labelKey: 'Timestamp' },
  { value: 'Int', labelKey: 'Integer' },
  { value: 'Float', labelKey: 'Float' },
  { value: 'Bool', labelKey: 'Boolean' },
  { value: 'Coords', labelKey: 'GPS Coords' },
  { value: 'IpAddress', labelKey: 'IP Address' },
];

export function FieldDetailPanel({
  tableId,
  fieldId,
  onClose,
}: {
  tableId: string;
  fieldId: string;
  onClose: () => void;
}) {
  const { tablesState, updateField, updateTableState, removeField } = UploadDataDrawerContext.useValue();
  const { t } = useTranslation(['data']);
  const tableState = tablesState[tableId]!;
  const field = tableState.fields.find((f) => f.id === fieldId);

  const isNameDuplicate = useMemo(() => {
    if (!field) return false;
    return tableState.fields.some((f) => f.id !== fieldId && f.name === field.name);
  }, [field, fieldId, tableState.fields]);

  const typeSelectOptions = useMemo(
    () =>
      dataTypeOptions.map((opt) => ({
        label: (
          <span className="flex items-center gap-v2-sm">
            <Icon icon={getDataTypeIcon(opt.value) ?? 'minus'} className="size-4" />
            <span>{opt.labelKey}</span>
          </span>
        ),
        value: opt.value,
      })),
    [],
  );

  const semanticOptions = useMemo(() => {
    if (!field) return [];
    const options = semanticTypesByDataType[field.dataType as keyof typeof semanticTypesByDataType];
    if (!options) return [];
    return options.map((opt: { value: string }) => ({
      label: t(`data:upload_data.field_semantic.${opt.value}`),
      value: opt.value,
    }));
  }, [field, t]);

  const semanticSubOptions = useMemo(() => {
    if (!field || !field.semanticType) return [];
    const subOpts = getSemanticSubOptions(field.dataType as DataTypeKey, field.semanticType as SemanticType);
    if (!subOpts) return [];
    return subOpts.map((opt) => ({
      label: t(`data:upload_data.field_semantic_sub.${opt.value}`),
      value: opt.value,
    }));
  }, [field, t]);

  if (!field) return null;

  function update(values: Parameters<typeof updateField>[2]) {
    updateField(tableId, fieldId, values);
  }

  const mockedValue = getMockValue(field.dataType, field.semanticType, field.semanticSubType);

  return (
    <div className="flex w-1/2 shrink-0 flex-col border-l border-grey-border overflow-y-auto">
      <div className="flex items-center justify-between p-v2-md border-b border-grey-border">
        <div className="flex items-center gap-v2-sm">
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-grey-border">
            <Icon icon="x" className="size-4" />
          </button>
          <h4 className="text-m font-semibold">{t('data:upload_data.field_detail_title')}</h4>
        </div>
        <button
          type="button"
          onClick={() => {
            removeField(tableId, fieldId);
            onClose();
          }}
          className="rounded-lg p-1 text-grey-secondary hover:bg-grey-border hover:text-red-primary"
        >
          <Icon icon="delete" className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-v2-lg p-v2-lg">
        {/* Type of the field */}
        <div className="flex flex-col gap-v2-xs">
          <label className="text-s text-grey-secondary">{t('data:upload_data.field_type_label')}</label>
          <SelectV2
            value={field.dataType}
            placeholder=""
            onChange={(value) => update({ dataType: value })}
            options={typeSelectOptions}
            disabled={!field.isNew}
          />
        </div>

        {/* Name of the field */}
        <div className="flex flex-col gap-v2-xs">
          <label className="text-s text-grey-secondary">{t('data:upload_data.field_name_label')}</label>
          <Input value={field.name} onChange={(e) => update({ name: e.currentTarget.value })} disabled={!field.isNew} />
          {isNameDuplicate ? (
            <p className="text-xs text-red-primary">{t('data:upload_data.field_name_unique_error')}</p>
          ) : null}
          {!field.name ? (
            <p className="text-xs text-red-primary">{t('data:upload_data.field_name_required_error')}</p>
          ) : null}
        </div>

        {/* Alias */}
        <div className="flex flex-col gap-v2-xs">
          <label className="text-s text-grey-secondary">{t('data:upload_data.field_alias')}</label>
          <Input value={field.alias} onChange={(e) => update({ alias: e.currentTarget.value })} />
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
            <Switch checked={!field.nullable} onCheckedChange={(checked) => update({ nullable: !checked })} />
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
              onChange={(value) => update({ semanticType: value as SemanticType })}
              options={semanticOptions}
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
              onChange={(value) => update({ semanticSubType: value as SemanticSubType })}
              options={semanticSubOptions}
            />
          </div>
        ) : null}

        {/* Currency-specific: currency exponent (only when semantic type is number and sub type is currency) */}
        {field.semanticType === 'monetary_amount' ? (
          <div className="flex flex-col gap-v2-sm rounded-lg border border-grey-border p-v2-md">
            <span className="text-s text-grey-secondary">{t('data:upload_data.field_currency_settings')}</span>
            <div className="flex flex-col gap-v2-xs">
              <label className="text-s text-grey-secondary">{t('data:upload_data.field_currency_exponent')}</label>
              <NumberInput
                min={0}
                max={10}
                value={field.currencyExponent ?? 0}
                onChange={(value) => update({ currencyExponent: Math.min(10, Math.max(0, value)) })}
              />
            </div>
            <div className="flex flex-col gap-v2-xs">
              <label className="text-s text-grey-secondary">{t('data:upload_data.field_decimal_precision')}</label>
              <NumberInput
                min={0}
                max={10}
                value={field.decimalPrecision ?? 2}
                onChange={(value) => update({ decimalPrecision: Math.min(10, Math.max(0, value)) })}
              />
            </div>
          </div>
        ) : null}

        {/* Timestamp-specific: main ordering timestamp (only one per table) */}
        {field.dataType === 'Timestamp' ? (
          <div className="flex flex-col gap-v2-sm rounded-lg border border-grey-border p-v2-md">
            <span className="text-s text-grey-secondary">{t('data:upload_data.field_timestamp_settings')}</span>
            <label className="flex items-center gap-v2-sm cursor-pointer">
              <Switch
                checked={tableState.mainTimestampFieldId === fieldId}
                onCheckedChange={(checked) =>
                  updateTableState(tableId, { mainTimestampFieldId: checked ? fieldId : '' })
                }
              />
              <span className="text-s">{t('data:upload_data.field_main_ordering_timestamp')}</span>
            </label>
          </div>
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
                }}
                value={mockedValue}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
