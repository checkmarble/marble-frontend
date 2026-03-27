import { type DataModelField, type DataModelTableOptions, type TableModel } from '@app-builder/models';
import { createContext, useContext } from 'react';
import { DataFieldsProps } from './DataFields';
import { type MetadataType, type TYPE_DATA_TABLE_VISUALISATION_PRESET, type VALID_DATA_TYPE } from './data-type';

export type DataVisualisationOptions = DataFieldsProps['options'];

type POSSIBLE_PRESET = TYPE_DATA_TABLE_VISUALISATION_PRESET | 'custom' | undefined;

type DataVisualisationContext = {
  currency: string | undefined;
  country: string | undefined;
  preset: POSSIBLE_PRESET;
  options: DataVisualisationOptions | undefined;
  table: TableModel | undefined;
  tableOptions: DataModelTableOptions | undefined;
};

const DataVisualisationContext = createContext<DataVisualisationContext>({
  currency: undefined,
  country: undefined,
  preset: undefined,
  options: undefined,
  table: undefined,
  tableOptions: undefined,
});
DataVisualisationContext.displayName = 'DataVisualisationContext';

export const DataVisualisationProvider = DataVisualisationContext.Provider;

export function useCurrency() {
  return useContext(DataVisualisationContext).currency;
}

export function useDetectedCountry() {
  return useContext(DataVisualisationContext).country;
}

export function usePreset() {
  return useContext(DataVisualisationContext).preset;
}

export function useOptions() {
  return useContext(DataVisualisationContext).options;
}

export function useTable() {
  return useContext(DataVisualisationContext).table;
}

export function useTableOptions() {
  return useContext(DataVisualisationContext).tableOptions;
}

// Per-field context — set by DataField, consumed by render functions
type DataFieldContextValue = {
  field: DataModelField | undefined;
  value: string | number | boolean | undefined;
  metaData: MetadataType | undefined;
  fieldType: VALID_DATA_TYPE;
  currency?: string;
};

const DataFieldContext = createContext<DataFieldContextValue>({
  field: undefined,
  value: undefined,
  metaData: undefined,
  fieldType: 'string-free',
});
DataFieldContext.displayName = 'DataFieldContext';

export const DataFieldProvider = DataFieldContext.Provider;

export function useDataField(): DataFieldContextValue {
  return useContext(DataFieldContext);
}

export function useFieldValue() {
  return useContext(DataFieldContext).value;
}

export function useFieldMetaData() {
  return useContext(DataFieldContext).metaData;
}

export function useField() {
  return useContext(DataFieldContext).field;
}

export function useFieldType() {
  return useContext(DataFieldContext).fieldType;
}

export function useFieldCurrency() {
  return useContext(DataFieldContext).currency;
}
