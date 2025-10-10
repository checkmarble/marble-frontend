import { createSimpleContext } from '@marble/shared';

export interface FiltersBarContextValue {
  emitSet: (name: string, value: unknown) => void;
  emitRemove: (name: string) => void;
  emitToggleActive: (name: string, isActive: boolean) => void;
  getValue: (name: string) => unknown;
  isActive: (name: string) => boolean;
}

export const FiltersBarContext = createSimpleContext<FiltersBarContextValue | null>('FiltersBar');

export function useFiltersBarContext(): FiltersBarContextValue {
  const ctx = FiltersBarContext.useValue();
  if (ctx) return ctx;

  throw new Error('useFiltersBarContext must be used within FiltersBar');
}
