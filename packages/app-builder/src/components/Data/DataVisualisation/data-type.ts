import { parseUnknownData } from '@app-builder/utils/parse';
import { ComponentType } from 'react';

const SEMANTIC_DATA_TYPE = {
  string: ['main', 'country', 'city', 'phone', 'email', 'iban', 'currency', 'link', 'code', 'vpn', 'free', 'id'],
  date: ['birthdate', 'date', 'datetime', 'time'],
  data: ['gps_coords', 'ip_address'],
  number: ['integer', 'float', 'currency', 'percentile'],
  enum: ['key_value', 'colors', 'values'],
  boolean: ['checkbox', 'yes_no'],
} as const;

export type MAIN_DATA_TYPE = keyof typeof SEMANTIC_DATA_TYPE;
export type VALID_DATA_TYPE = {
  [Key in MAIN_DATA_TYPE]: `${Key}-${(typeof SEMANTIC_DATA_TYPE)[Key][number]}`;
}[MAIN_DATA_TYPE];

export const DATA_TABLE_VISUALISATION_PRESET = ['essentials', 'advanced', 'full'] as const;
export type TYPE_DATA_TABLE_VISUALISATION_PRESET = (typeof DATA_TABLE_VISUALISATION_PRESET)[number];

export type MetadataType = ReturnType<typeof parseUnknownData>;

export type StringKey = Extract<VALID_DATA_TYPE, `string-${string}` | `date-${string}` | `enum-${string}`>;
export type DataKey = Extract<VALID_DATA_TYPE, `data-${string}`>;
export type NumberKey = Extract<VALID_DATA_TYPE, `number-${string}`>;
export type BooleanKey = Extract<VALID_DATA_TYPE, `boolean-${string}`>;

type PropsForKey<K extends VALID_DATA_TYPE> = K extends StringKey
  ? { value?: string }
  : K extends DataKey
    ? { value?: string; metaData?: MetadataType }
    : K extends NumberKey
      ? { value?: number }
      : K extends BooleanKey
        ? { value?: boolean }
        : never;

export type FieldTypeComponentMap = { [K in VALID_DATA_TYPE]: ComponentType<PropsForKey<K>> };
