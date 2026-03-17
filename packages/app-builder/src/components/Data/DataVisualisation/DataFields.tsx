import { type DataModelField, DataModelObject } from '@app-builder/models';
import { useDataModel } from '@app-builder/services/data/data-model';
import { adaptCurrency } from '@app-builder/utils/currencies';
import CountryFlag from 'country-flag-emojis';
import cc from 'currency-codes';
import { useMemo } from 'react';
import { cn } from 'ui-design-system';
import { DataVisualisationProvider } from './currency-context';
import { DataField } from './DataField';
import { type TYPE_DATA_TABLE_VISUALISATION_PRESET } from './data-type';

type DataFieldsProps =
  | {
      table: string;
      object: DataModelObject;
      preset?: TYPE_DATA_TABLE_VISUALISATION_PRESET;
      customFields?: never;
      className?: string;
    }
  | {
      table: string;
      object: DataModelObject;
      preset: 'custom';
      customFields: string[];
      className?: string;
    };

export function DataFields({ table, object, preset, customFields, className }: DataFieldsProps) {
  const dataModel = useDataModel();
  const tableModel = dataModel.find((tbl) => tbl.name === table);

  const fields = useMemo(() => {
    if (preset === 'custom') {
      return customFields.map((field) => tableModel?.fields.find((fld) => fld.name === field));
    }
    return filterFieldsByPreset(tableModel?.fields ?? [], preset ?? 'essentials');
  }, [tableModel, preset, customFields]);

  const contextValue = useMemo(() => {
    if (!tableModel) return { currency: undefined, country: undefined };

    // Detect country
    const countryField = tableModel.fields.find((f) => /country/i.test(f.name));
    const rawCountry = countryField ? object.data?.[countryField.name] : undefined;
    const country = typeof rawCountry === 'string' && rawCountry.length > 0 ? rawCountry.toUpperCase() : undefined;

    // Priority 1: explicit currency field
    const currencyField = tableModel.fields.find((f) => /currency/i.test(f.name));
    const rawCurrency = currencyField ? object.data?.[currencyField.name] : undefined;
    if (typeof rawCurrency === 'string' && rawCurrency.length > 0) {
      const currency = adaptCurrency(rawCurrency, false);
      if (currency) return { currency, country };
    }

    // Priority 2: derive from country
    if (country) {
      try {
        const countryInfo = CountryFlag.byCountryCode(country);
        const currencyRecords = cc.country(countryInfo.nameEnglish);
        const code = currencyRecords[0]?.code;
        const currency = code ? adaptCurrency(code, false) : undefined;
        return { currency, country };
      } catch {
        // byCountryCode throws on invalid code
      }
    }

    return { currency: undefined, country };
  }, [tableModel, object.data]);

  return (
    <DataVisualisationProvider value={contextValue}>
      <div className={cn('grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 break-all', className)}>
        {Array.isArray(fields)
          ? fields.map((field) => {
              return field ? (
                <DataField key={field?.id} field={field} value={formatValue(object.data?.[field.name])} />
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
      return fields.filter((field) => field.nullable === false);
    case 'advanced':
    case 'full':
      return fields;
  }
}

function formatValue(value: unknown): string | number | boolean | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return undefined;
}
