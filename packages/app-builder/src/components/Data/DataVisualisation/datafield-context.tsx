import { type Currency } from 'dinero.js';
import { createContext, useContext } from 'react';
import { DataFieldsProps } from './DataFields';
import { type TYPE_DATA_TABLE_VISUALISATION_PRESET } from './data-type';

export type DataVisualisationOptions = DataFieldsProps['options'];

type POSSIBLE_PRESET = TYPE_DATA_TABLE_VISUALISATION_PRESET | 'custom' | undefined;

type DataVisualisationContext = {
  currency: Currency<number> | undefined;
  country: string | undefined;
  preset: POSSIBLE_PRESET;
  options: DataVisualisationOptions | undefined;
};

const DataVisualisationContext = createContext<DataVisualisationContext>({
  currency: undefined,
  country: undefined,
  preset: undefined,
  options: undefined,
});
DataVisualisationContext.displayName = 'DataVisualisationContext';

export const DataVisualisationProvider = DataVisualisationContext.Provider;

export function useCurrency(): Currency<number> | undefined {
  return useContext(DataVisualisationContext).currency;
}

export function useDetectedCountry(): string | undefined {
  return useContext(DataVisualisationContext).country;
}

export function usePreset(): POSSIBLE_PRESET {
  return useContext(DataVisualisationContext).preset;
}

export function useOptions(): DataVisualisationOptions | undefined {
  return useContext(DataVisualisationContext).options;
}
