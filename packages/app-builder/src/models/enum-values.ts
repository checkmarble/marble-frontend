import * as countryCatalog from 'country-flag-emojis/flags';
import cc from 'currency-codes';
import type { DataModelField, EnumValue } from './data-model';
import type { CountryCodeFormat, EnumColors } from './enum';

export type EnumField = Pick<
  DataModelField,
  'dataType' | 'isEnum' | 'semanticType' | 'semanticSubType' | 'values' | 'enumValues' | 'countryCodeFormat'
>;
const countries = Object.values(countryCatalog).filter(
  (country) => /^[A-Z]{2}$/.test(country.isoAlpha2) && /^[A-Z]{3}$/.test(country.isoAlpha3),
);

export function isEnumField(field: Pick<EnumField, 'isEnum' | 'semanticType'>) {
  return field.isEnum || field.semanticType === 'enum';
}

export function resolveCountry(value: string) {
  const code = value.toUpperCase();
  return countries.find((country) => (code.length === 3 ? country.isoAlpha3 : country.isoAlpha2) === code);
}

export function resolveCountryCodeFormat(field: EnumField, currentValues: EnumValue[] = []): CountryCodeFormat {
  if (field.countryCodeFormat) return field.countryCodeFormat;
  const formats = new Set(
    [...(field.values ?? []), ...currentValues].flatMap((value) =>
      typeof value === 'string' && resolveCountry(value)
        ? [value.length === 3 ? ('alpha3' as const) : ('alpha2' as const)]
        : [],
    ),
  );
  return formats.size === 1 ? [...formats][0]! : 'alpha2';
}

export function resolveEnumValues(field: EnumField, currentValues: EnumValue[] = []) {
  const numeric = field.dataType === 'Int' || field.dataType === 'Float';
  const subtype = numeric ? undefined : field.semanticSubType;
  const closed = !numeric && (subtype === 'country' || subtype === 'key_color_value');
  let values: EnumValue[];
  if (subtype === 'country') {
    const format = resolveCountryCodeFormat(field, currentValues);
    values = countries.map((country) => (format === 'alpha3' ? country.isoAlpha3 : country.isoAlpha2));
  } else if (subtype === 'key_color_value') {
    values = field.enumValues?.map((entry) => entry.key) ?? [];
  } else if (subtype === 'currency') {
    values = [...cc.codes(), ...(field.values ?? []), ...currentValues];
  } else {
    values = [...(field.values ?? []), ...currentValues];
  }
  return { closed, values: [...new Set(values)] };
}

export type EnumDisplay = { label: string; color?: EnumColors; flag?: string; neutral?: boolean };
export function resolveEnumDisplay(field: EnumField, value: EnumValue, language: string): EnumDisplay {
  const raw = String(value);
  if (field.dataType === 'Int' || field.dataType === 'Float') return { label: raw };
  if (field.semanticSubType === 'key_color_value') {
    const entry = field.enumValues?.find((entry) => entry.key === value) ?? field.enumValues?.at(-1);
    return entry ? { label: entry.key, color: entry.color } : { label: raw };
  }
  if (field.semanticSubType === 'country' || field.semanticType === 'country') {
    const country = resolveCountry(raw);
    return country
      ? {
          label: new Intl.DisplayNames([language], { type: 'region' }).of(country.isoAlpha2) ?? raw,
          flag: country.flag,
        }
      : { label: raw, neutral: true };
  }
  if (field.semanticSubType === 'currency') {
    const currency = cc.code(raw.toUpperCase());
    return { label: currency ? `${currency.code} – ${currency.currency}` : raw };
  }
  return { label: raw };
}
