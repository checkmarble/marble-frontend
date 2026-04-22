import { type DataModelField, DataModelObject } from '@app-builder/models';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useFormatDateTime } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { cn } from 'ui-design-system';
import { DataField } from './DataField';
import { type TYPE_DATA_TABLE_VISUALISATION_PRESET } from './data-type';
import { getLinksFromDatamodel, hasMetadataContent, isMetadataKey, METADATA_FIELDS } from './dataFieldsUtils';
import { DataVisualisationProvider } from './datafield-context';

export type DataFieldsProps = (
  | {
      preset?: TYPE_DATA_TABLE_VISUALISATION_PRESET;
      customFields?: never;
    }
  | {
      preset: 'custom';
      customFields: string[];
    }
) & {
  table: string;
  object: DataModelObject;
  className?: string;
  options?: {
    mapHeight?: number;
    hideLinks?: boolean;
    hideMetadata?: boolean;
    showHeader?: boolean;
    withId?: boolean;
    layout?: '1-column' | '2-columns' | '3-columns';
  };
};

export function DataFields({ table, object, preset, customFields, className, options }: DataFieldsProps) {
  const dataModel = useDataModel();
  const tableModel = dataModel.find((tbl) => tbl.name === table);

  const links = options?.hideLinks ? undefined : getLinksFromDatamodel(dataModel, table);

  const fields = useMemo(() => {
    if (preset === 'custom') {
      return customFields.map((field) => tableModel?.fields.find((fld) => fld.name === field));
    }
    return filterFieldsByPreset(tableModel?.fields ?? [], preset ?? 'full', options);
  }, [tableModel, preset, customFields, options]);

  const contextValue = useMemo(() => {
    if (!tableModel) return { currency: undefined, country: undefined, preset, options, table: undefined };

    // Detect country
    const countryField = tableModel.fields.find((f) => /country/i.test(f.name));
    const rawCountry = countryField ? object.data?.[countryField.name] : undefined;
    const country = typeof rawCountry === 'string' && rawCountry.length > 0 ? rawCountry.toUpperCase() : undefined;

    // Search for explicit currency field (semantic)
    let currencyField = tableModel.fields.find((f) => f.semanticType === 'currency_code');
    // fallback search from field name (only if there is only one of them)
    if (!currencyField) {
      const currencyFields = tableModel.fields.filter((f) => /currency|curr_/i.test(f.name));
      currencyField = currencyFields.length === 1 ? currencyFields[0] : undefined;
    }
    const rawCurrency = currencyField ? object.data?.[currencyField.name] : undefined;
    if (typeof rawCurrency === 'string' && rawCurrency.length > 0) {
      return { currency: rawCurrency, country, preset, options, table: tableModel };
    }

    return { currency: undefined, country, preset, options, table: tableModel };
  }, [
    tableModel,
    object.data,
    preset,
    options?.mapHeight,
    options?.hideLinks,
    options?.hideMetadata,
    options?.showHeader,
    options?.withId,
    options?.layout,
  ]);

  const metaData = useMemo(() => {
    const allParsed = R.pipe(object.data, R.omit(METADATA_FIELDS), R.mapValues(parseUnknownData));
    const metadataByField: Record<string, ReturnType<typeof parseUnknownData>> = {};

    for (const [key, value] of R.entries(allParsed)) {
      const meta = isMetadataKey(key);
      if (meta.match) {
        // Always capture metadata regardless of type/content to prevent
        // them from appearing as separate entries in the field list
        metadataByField[meta.parentKey] = value;
      }
    }

    return metadataByField;
  }, [object.data]);

  return (
    <DataVisualisationProvider value={contextValue}>
      {options?.showHeader ? <DataFieldsHeader object={object} /> : null}
      <div
        className={cn(
          'grid auto-rows-[minmax(2rem,auto)] items-stretch gap-x-4 gap-y-2 break-all',
          options?.layout === '2-columns' && 'grid-cols-[max-content_1fr_max-content_1fr]',
          options?.layout === '3-columns' && 'grid-cols-[max-content_1fr_max-content_1fr_max-content_1fr]',
          (options?.layout === '1-column' || !options?.layout) && 'grid-cols-[max-content_1fr]',
          className,
        )}
      >
        {Array.isArray(fields)
          ? fields.map((field) => {
              const linkedTo = field ? links?.[field.name] : undefined;
              const metaDataValue =
                field && hasMetadataContent(metaData?.[field?.name]) ? metaData?.[field?.name] : undefined;
              const fieldCurrency = resolveFieldCurrency(field, tableModel?.fields, object.data);
              return field ? (
                <DataField
                  key={field?.id}
                  field={field}
                  value={formatValue(object.data?.[field.name])}
                  linkedTo={linkedTo}
                  metaData={metaDataValue}
                  currency={fieldCurrency}
                />
              ) : null;
            })
          : null}
      </div>
    </DataVisualisationProvider>
  );
}

function filterFieldsByPreset(
  fields: DataModelField[],
  preset: TYPE_DATA_TABLE_VISUALISATION_PRESET,
  options?: { withId?: boolean },
) {
  switch (preset) {
    case 'essentials': {
      const withId = options?.withId !== false; // default to true
      return fields.filter(
        (field) => !field.hidden && (field.nullable === false || (withId && field.name === 'object_id')),
      );
    }
    case 'advanced':
    // tbd
    case 'full':
      return fields.filter((field) => !field.hidden || field.name === 'object_id');
  }
}

function resolveFieldCurrency(
  field: DataModelField | undefined,
  allFields: DataModelField[] | undefined,
  data: Record<string, unknown> | undefined,
): string | undefined {
  if (!field?.currencyFieldId || !allFields || !data) return undefined;
  const currencyField = allFields.find((f) => f.name === field.currencyFieldId || f.id === field.currencyFieldId);
  if (!currencyField) return undefined;
  const raw = data[currencyField.name];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

function formatValue(value: unknown): string | number | boolean | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  return undefined;
}

function DataFieldsHeader({ object }: { object: DataModelObject }) {
  const { t } = useTranslation(['data']);
  const formatDateTime = useFormatDateTime();
  const objectId = object.data?.['object_id'] as string;
  return (
    <div className="text-m col-span-full flex items-center gap-2 mb-2">
      <span className="bg-surface-card border-blue-58 text-blue-58 rounded-sm border px-2 py-1">ID: {objectId}</span>
      <span className="bg-surface-card border-grey-placeholder text-grey-secondary rounded-sm border px-2 py-1">
        {t('data:last_ingestion_at', {
          date: formatDateTime(object.metadata.validFrom, {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
        })}
      </span>
    </div>
  );
}
