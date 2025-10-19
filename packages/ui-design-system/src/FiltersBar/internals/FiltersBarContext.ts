import { createSimpleContext } from '@marble/shared';
import { type FilterValue } from '../types';

export interface FiltersBarContextValue {
  emitSet: (name: string, value: FilterValue) => void;
  emitRemove: (name: string) => void;
  getValue: (name: string) => FilterValue;
}

export const FiltersBarContext = createSimpleContext<FiltersBarContextValue | null>('FiltersBar');

export function useFiltersBarContext(): FiltersBarContextValue {
  return FiltersBarContext.useValue();
}
