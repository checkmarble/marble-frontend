import { createContext, useContext } from 'react';

export interface FiltersBarContextValue {
  emitSet: (name: string, value: unknown) => void;
  emitRemove: (name: string) => void;
  emitToggleActive: (name: string, isActive: boolean) => void;
  getValue: (name: string) => unknown;
  isActive: (name: string) => boolean;
}

export const FiltersBarContext = createContext<FiltersBarContextValue | null>(null);

export function useFiltersBarContext(): FiltersBarContextValue {
  const ctx = useContext(FiltersBarContext);
  if (ctx) return ctx;

  throw new Error('useFiltersBarContext must be used within FiltersBar');
}
