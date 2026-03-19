import { type DataModelField, DataModelObject } from '@app-builder/models';
import { useDataModel } from '@app-builder/services/data/data-model';
import { adaptCurrency } from '@app-builder/utils/currencies';
import { useFormatDateTime } from '@app-builder/utils/format';
import { parseUnknownData } from '@app-builder/utils/parse';
import CountryFlag from 'country-flag-emojis';
import cc from 'currency-codes';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { cn } from 'ui-design-system';
import { DataField } from './DataField';
import { type TYPE_DATA_TABLE_VISUALISATION_PRESET } from './data-type';
import { getLinkksFromDatamodel, hasMetadataContent, isMetadataKey, METADATA_FIELDS } from './dataFieldsUtils';
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
    layout?: '1-column' | '2-columns' | '3-columns';
  };
};

export function DataFields({ table, object, preset, customFields, className, options }: DataFieldsProps) {
  const dataModel = useDataModel();
  const tableModel = dataModel.find((tbl) => tbl.name === table);

  const links = options?.hideLinks ? undefined : getLinkksFromDatamodel(dataModel, table);

  const fields = useMemo(() => {
    if (preset === 'custom') {
      return customFields.map((field) => tableModel?.fields.find((fld) => fld.name === field));
    }
    return filterFieldsByPreset(tableModel?.fields ?? [], preset ?? 'full');
  }, [tableModel, preset, customFields]);

  const contextValue = useMemo(() => {
    if (!tableModel) return { currency: undefined, country: undefined, preset, options };

    // Detect country
    const countryField = tableModel.fields.find((f) => /country/i.test(f.name));
    const rawCountry = countryField ? object.data?.[countryField.name] : undefined;
    const country = typeof rawCountry === 'string' && rawCountry.length > 0 ? rawCountry.toUpperCase() : undefined;

    // Priority 1: explicit currency field
    const currencyField = tableModel.fields.find((f) => /currency/i.test(f.name));
    const rawCurrency = currencyField ? object.data?.[currencyField.name] : undefined;
    if (typeof rawCurrency === 'string' && rawCurrency.length > 0) {
      const currency = adaptCurrency(rawCurrency, false);
      if (currency) return { currency, country, preset, options };
    }

    // Priority 2: derive from country
    if (country) {
      try {
        const countryInfo = CountryFlag.byCountryCode(country);
        const currencyRecords = cc.country(countryInfo.nameEnglish);
        const code = currencyRecords[0]?.code;
        const currency = code ? adaptCurrency(code, false) : undefined;
        return { currency, country, preset, options };
      } catch {
        // byCountryCode throws on invalid code
      }
    }

    return { currency: undefined, country, preset, options };
  }, [tableModel, object.data, preset, options]);

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

function filterFieldsByPreset(fields: DataModelField[], preset: TYPE_DATA_TABLE_VISUALISATION_PRESET) {
  switch (preset) {
    case 'essentials':
      return fields.filter((field) => field.nullable === false && field.name !== 'object_id');
    case 'advanced':
    case 'full':
      return fields;
  }
}

function formatValue(value: unknown): string | number | boolean | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  return undefined;
}

export function DataFieldsHeader({ object }: { object: DataModelObject }) {
  const { t } = useTranslation(['data']);
  const formatDateTime = useFormatDateTime();
  const objectId = object.data?.['object_id'] as string;
  const options = useOptions();
  if (options?.hideHeader) return null;

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
