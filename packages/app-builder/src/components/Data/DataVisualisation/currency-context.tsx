import { type Currency } from 'dinero.js';
import { createContext, useContext } from 'react';

type DataVisualisationContext = {
  currency: Currency<number> | undefined;
  country: string | undefined;
};

const DataVisualisationContext = createContext<DataVisualisationContext>({
  currency: undefined,
  country: undefined,
});
DataVisualisationContext.displayName = 'DataVisualisationContext';

export const DataVisualisationProvider = DataVisualisationContext.Provider;

export function useCurrency(): Currency<number> | undefined {
  return useContext(DataVisualisationContext).currency;
}

export function useDetectedCountry(): string | undefined {
  return useContext(DataVisualisationContext).country;
}
