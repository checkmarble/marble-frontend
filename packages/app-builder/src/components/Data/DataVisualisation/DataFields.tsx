import { type DataModelField, DataModelObject } from '@app-builder/models';
import { useTableOptionsQuery } from '@app-builder/queries/data/get-table-options';
import { useDataModel } from '@app-builder/services/data/data-model';
import { adaptCurrency } from '@app-builder/utils/currencies';
import { useFormatDateTime } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import { tryCatch } from '@app-builder/utils/tryCatch';
import CountryFlag from 'country-flag-emojis';
import cc from 'currency-codes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { cn } from 'ui-design-system';
import { DataField } from './DataField';
import { type TYPE_DATA_TABLE_VISUALISATION_PRESET } from './data-type';
import { getLinksFromDatamodel, hasMetadataContent, isMetadataKey, METADATA_FIELDS } from './dataFieldsUtils';
import { DataVisualisationProvider, useOptions } from './datafield-context';

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
    hideHeader?: boolean;
    withId?: boolean;
    layout?: '1-column' | '2-columns' | '3-columns';
  };
};

export function DataFields({ table, object, preset, customFields, className, options }: DataFieldsProps) {
  const dataModel = useDataModel();
  const tableModel = dataModel.find((tbl) => tbl.name === table);

  const { data: tableOptionsData, isPending: isTableOptionsPending } = useTableOptionsQuery(tableModel?.id);
  const tableOptions = tableOptionsData?.tableOptions;

  const links = options?.hideLinks ? undefined : getLinksFromDatamodel(dataModel, table);

  const fields = useMemo(() => {
    if (preset === 'custom') {
      return customFields.map((field) => tableModel?.fields.find((fld) => fld.name === field));
    }
    return filterFieldsByPreset(
      tableModel?.fields ?? [],
      preset ?? 'full',
      tableOptions?.fieldOrder,
      tableOptions?.displayedFields,
      options,
    );
  }, [tableModel, preset, customFields, tableOptions?.fieldOrder, tableOptions?.displayedFields]);

  const contextValue = useMemo(() => {
    if (!tableModel)
      return { currency: undefined, country: undefined, preset, options, table: undefined, tableOptions };

    // Detect country
    const countryField = tableModel.fields.find((f) => /country/i.test(f.name));
    const rawCountry = countryField ? object.data?.[countryField.name] : undefined;
    const country = typeof rawCountry === 'string' && rawCountry.length > 0 ? rawCountry.toUpperCase() : undefined;

    // Priority 1: explicit currency field
    const currencyField = tableModel.fields.find((f) => /currency/i.test(f.name));
    const rawCurrency = currencyField ? object.data?.[currencyField.name] : undefined;
    if (typeof rawCurrency === 'string' && rawCurrency.length > 0) {
      const currency = adaptCurrency(rawCurrency, false);
      if (currency) return { currency, country, preset, options, table: tableModel, tableOptions };
    }

    // Priority 2: derive from country
    if (country) {
      const result = tryCatch(() => {
        const countryInfo = CountryFlag.byCountryCode(country);
        const currencyRecords = cc.country(countryInfo.nameEnglish);
        const code = currencyRecords[0]?.code;
        const currency = code ? adaptCurrency(code, false) : undefined;
        return { currency, country, preset, options, table: tableModel, tableOptions };
      });
      if (result.ok) return result.value;
    }

    return { currency: undefined, country, preset, options, table: tableModel, tableOptions };
  }, [
    tableModel,
    object.data,
    preset,
    tableOptions,
    options?.mapHeight,
    options?.hideLinks,
    options?.hideMetadata,
    options?.hideHeader,
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

  if (isTableOptionsPending) return null;

  return (
    <DataVisualisationProvider value={contextValue}>
      <div
        className={cn(
          'grid gap-x-4 gap-y-2 break-all',
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
              return field ? (
                <DataField
                  key={field?.id}
                  field={field}
                  value={formatValue(object.data?.[field.name])}
                  linkedTo={linkedTo}
                  metaData={metaDataValue}
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
  fieldOrder?: string[],
  displayedFields?: string[],
  options?: {
    withId?: boolean;
  },
) {
  const filtered = (() => {
    switch (preset) {
      case 'essentials': {
        const withId = options?.withId !== false; // default to true
        return fields.filter((field) => field.nullable === false || (withId && field.name === 'object_id'));
      }
      case 'advanced':
      // tbd
      case 'full':
        return fields;
    }
  })();

  const visible = displayedFields
    ? filtered.filter((field) => field.name === 'object_id' || displayedFields.includes(field.id))
    : filtered;

  if (!fieldOrder || fieldOrder.length === 0) return visible;

  return [...visible].sort((a, b) => {
    const ai = fieldOrder.indexOf(a.id);
    const bi = fieldOrder.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function formatValue(value: unknown): string | number | boolean | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  return undefined;
}

export function DataFieldsHeader({
  object,
  hideHeader: hideHeaderProp,
}: {
  object: DataModelObject;
  hideHeader?: boolean;
}) {
  const { t } = useTranslation(['data']);
  const formatDateTime = useFormatDateTime();
  const objectId = object.data?.['object_id'] as string;
  const options = useOptions();
  if (hideHeaderProp ?? options?.hideHeader) return null;

  return (
    <div className="text-m col-span-full flex items-center gap-2">
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
