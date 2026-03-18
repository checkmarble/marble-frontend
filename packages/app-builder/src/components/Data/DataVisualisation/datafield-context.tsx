import { type Currency } from 'dinero.js';
import { createContext, useContext } from 'react';
import { type TYPE_DATA_TABLE_VISUALISATION_PRESET } from './data-type';

export type DataVisualisationOptions = {
  mapHeight?: number;
};

type DataVisualisationContext = {
  currency: Currency<number> | undefined;
  country: string | undefined;
  preset: TYPE_DATA_TABLE_VISUALISATION_PRESET | 'custom' | undefined;
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

export function usePreset(): TYPE_DATA_TABLE_VISUALISATION_PRESET | 'custom' | undefined {
  return useContext(DataVisualisationContext).preset;
}

export function useOptions(): DataVisualisationOptions | undefined {
  return useContext(DataVisualisationContext).options;
}
