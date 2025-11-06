import { createContext, useContext } from 'react';

export interface I18nContextValue {
  locale: string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

const defaultValue: I18nContextValue = {
  locale: 'en',
  t: (key: string) => key,
};

const I18nContext = createContext<I18nContextValue>(defaultValue);

export function I18nProvider({ value, children }: { value: I18nContextValue; children: React.ReactNode }) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
